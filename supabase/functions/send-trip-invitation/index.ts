import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InvitationRequest {
  tripId: string;
  email: string;
  role: string;
  message?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key for database operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create client with user token for auth verification
    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader
          }
        }
      }
    );

    // Verify user authentication
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser();
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { tripId, email, role, message }: InvitationRequest = await req.json();

    console.log('Sending invitation:', { tripId, email, role, user: user.id });

    // Verify user is trip owner first
    const { data: tripData, error: tripError } = await supabaseUser
      .from('trips')
      .select('user_id, name, destination')
      .eq('id', tripId)
      .eq('user_id', user.id)
      .single();

    if (tripError || !tripData) {
      console.error('Trip ownership verification failed:', tripError);
      throw new Error('Only trip owners can send invitations');
    }

    console.log('Trip ownership verified for user:', user.id);

    // Generate secure token using crypto API (base64url encoding)
    const tokenBytes = new Uint8Array(32);
    crypto.getRandomValues(tokenBytes);
    const invitationToken = btoa(String.fromCharCode(...tokenBytes))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');

    console.log('Generated invitation token');

    // Call the database function to create invitation using user client
    const { data: invitationId, error: invitationError } = await supabaseUser
      .rpc('send_trip_invitation', {
        p_trip_id: tripId,
        p_email: email,
        p_role: role,
        p_token: invitationToken
      });

    if (invitationError) {
      console.error('Error creating invitation:', invitationError);
      throw new Error(`Failed to create invitation: ${invitationError.message}`);
    }

    // Get user profile for inviter name
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Error getting user profile:', profileError);
    }

    console.log('Invitation created successfully:', {
      id: invitationId,
      token: invitationToken,
      trip: tripData.name
    });

    // Create invitation link
    const baseUrl = req.headers.get('origin') || 'https://bc24aefb-3820-4bdb-bbd4-aa7d5ea01cf8.lovableproject.com';
    const invitationLink = `${baseUrl}/accept-invitation?token=${invitationToken}`;

    // Email content
    const destinations = Array.isArray(tripData.destination) 
      ? tripData.destination.join(', ')
      : tripData.destination || 'Various destinations';

    const emailData = {
      to: email,
      inviterName: profile?.full_name || 'Someone',
      tripName: tripData.name || 'Trip',
      destinations,
      role: role === 'editor' ? 'edit and collaborate on' : 'view',
      invitationLink,
      customMessage: message || '',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString()
    };

    console.log('Email data prepared:', emailData);

    // Send the invitation email
    try {
      const { error: emailError } = await supabaseAdmin.functions.invoke('send-invitation-email', {
        body: {
          invitationId: invitationId,
          tripName: emailData.tripName,
          inviterName: emailData.inviterName,
          email: emailData.to,
          role: role,
          token: invitationToken
        }
      });

      if (emailError) {
        console.error('Error sending invitation email:', emailError);
        // Don't fail the whole operation - invitation is already created
      } else {
        console.log('Invitation email sent successfully');
      }
    } catch (emailError) {
      console.error('Error invoking send-invitation-email function:', emailError);
      // Don't fail the whole operation - invitation is already created
    }

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        invitationId: invitationId,
        invitationLink,
        message: 'Invitation sent successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in send-trip-invitation function:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    );
  }
});