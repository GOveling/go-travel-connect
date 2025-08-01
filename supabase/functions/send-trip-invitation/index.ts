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

    // Call the database function to create invitation using admin client but with user context
    const { data: invitationId, error: invitationError } = await supabaseAdmin
      .rpc('send_trip_invitation', {
        p_trip_id: tripId,
        p_email: email,
        p_role: role
      }, {
        headers: {
          Authorization: authHeader
        }
      });

    if (invitationError) {
      console.error('Error creating invitation:', invitationError);
      throw new Error(`Failed to create invitation: ${invitationError.message}`);
    }

    // Get invitation details for email
    const { data: invitation, error: getError } = await supabaseAdmin
      .from('trip_invitations')
      .select(`
        *,
        trips:trip_id (name, destination),
        inviter:inviter_id (full_name)
      `)
      .eq('id', invitationId)
      .single();

    if (getError || !invitation) {
      console.error('Error getting invitation details:', getError);
      throw new Error('Failed to get invitation details');
    }

    console.log('Invitation created successfully:', {
      id: invitation.id,
      token: invitation.token,
      trip: invitation.trips?.name
    });

    // Create invitation link
    const baseUrl = req.headers.get('origin') || 'https://bc24aefb-3820-4bdb-bbd4-aa7d5ea01cf8.lovableproject.com';
    const invitationLink = `${baseUrl}/accept-invitation?token=${invitation.token}`;

    // Email content
    const destinations = Array.isArray(invitation.trips?.destination) 
      ? invitation.trips.destination.join(', ')
      : invitation.trips?.destination || 'Various destinations';

    const emailData = {
      to: email,
      inviterName: invitation.inviter?.full_name || 'Someone',
      tripName: invitation.trips?.name || 'Trip',
      destinations,
      role: role === 'editor' ? 'edit and collaborate on' : 'view',
      invitationLink,
      customMessage: message || '',
      expiresAt: new Date(invitation.expires_at).toLocaleDateString()
    };

    console.log('Email data prepared:', emailData);

    // Return success response
    return new Response(
      JSON.stringify({
        success: true,
        invitationId: invitation.id,
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