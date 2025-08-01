import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AcceptInvitationRequest {
  token: string;
}

const isValidInvitation = async (supabaseClient: any, token: string) => {
  const { data: invitation } = await supabaseClient
    .from('trip_invitations')
    .select('*')
    .eq('token', token)
    .single();

  if (!invitation) return false;

  const now = new Date();
  const expiresAt = new Date(invitation.expires_at);
  
  if (now > expiresAt) {
    await supabaseClient
      .from('trip_invitations')
      .update({ status: 'expired' })
      .eq('token', token);
    return false;
  }

  return true;
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    console.log('🔐 Authorization header present:', !!authHeader);
    
    if (!authHeader) {
      console.log('❌ No authorization header provided');
      throw new Error('No authorization header');
    }

    // Set auth for service role client
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    console.log('👤 User authentication result:', {
      hasUser: !!user,
      userEmail: user?.email,
      userId: user?.id?.substring(0, 8) + "...",
      authError: authError?.message
    });

    if (authError || !user) {
      console.log('❌ Authentication failed:', authError?.message || 'No user');
      throw new Error('Unauthorized');
    }

    // Get user profile to validate email
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();

    console.log('📧 Profile email validation:', {
      profileEmail: profile?.email,
      userEmail: user?.email,
      emailsMatch: profile?.email === user?.email,
      profileError: profileError?.message
    });

    const { token }: AcceptInvitationRequest = await req.json();

    console.log('🎫 Processing invitation acceptance:', {
      token,
      userEmail: user.email,
      userId: user.id.substring(0, 8) + "..."
    });

    // Validate invitation before accepting
    const isValid = await isValidInvitation(supabaseClient, token);
    if (!isValid) {
      console.log('❌ Invalid or expired invitation');
      throw new Error('Invalid or expired invitation token');
    }

    // First, let's check the invitation details before accepting
    const { data: invitationCheck, error: checkError } = await supabaseClient
      .from('trip_invitations')
      .select('*')
      .eq('token', token)
      .single();

    console.log('📋 Invitation check result:', {
      found: !!invitationCheck,
      email: invitationCheck?.email,
      status: invitationCheck?.status,
      expired: invitationCheck ? new Date(invitationCheck.expires_at) < new Date() : 'unknown',
      userEmail: user.email,
      emailMatch: invitationCheck?.email === user.email,
      checkError: checkError?.message
    });

    // Call the database function to accept invitation
    const { data: success, error: acceptError } = await supabaseClient
      .rpc('accept_trip_invitation', {
        p_token: token
      });

    console.log('🔄 Database function result:', {
      success,
      error: acceptError?.message,
      details: acceptError?.details,
      hint: acceptError?.hint
    });

    if (acceptError) {
      console.error('❌ Error accepting invitation:', acceptError);
      throw new Error(`Failed to accept invitation: ${acceptError.message}`);
    }

    if (!success) {
      console.log('❌ Database function returned false - invitation invalid/expired');
      throw new Error('Invalid or expired invitation token');
    }

    console.log('✅ Invitation accepted successfully');

    // Get the trip details for the response
    const { data: invitation, error: getError } = await supabaseClient
      .from('trip_invitations')
      .select(`
        trips:trip_id (id, name, destination)
      `)
      .eq('token', token)
      .eq('status', 'accepted')
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Invitation accepted successfully',
        trip: invitation?.trips || null
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in accept-trip-invitation function:', error);
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