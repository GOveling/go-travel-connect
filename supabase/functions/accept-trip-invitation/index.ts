import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AcceptInvitationRequest {
  token: string;
}

const isValidInvitation = async (supabaseClient: any, token: string, userEmail: string) => {
  const { data: invitation } = await supabaseClient
    .from('trip_invitations')
    .select('*')
    .eq('token', token)
    .eq('email', userEmail)
    .single();

  if (!invitation) {
    console.log('❌ No invitation found with token and email:', { token: token.substring(0, 10) + '...', userEmail });
    return { valid: false, error: 'invitation.not_found' };
  }

  // Check if invitation status is still pending
  if (invitation.status !== 'pending') {
    console.log('❌ Invitation already processed:', { status: invitation.status });
    return { 
      valid: false, 
      error: invitation.status === 'accepted' ? 'invitation.already_accepted' : 'invitation.already_processed'
    };
  }

  const now = new Date();
  const expiresAt = new Date(invitation.expires_at);
  
  if (now > expiresAt) {
    console.log('❌ Invitation expired:', { expiresAt, now });
    await supabaseClient
      .from('trip_invitations')
      .update({ status: 'expired' })
      .eq('token', token);
    return { valid: false, error: 'invitation.expired' };
  }

  console.log('✅ Valid invitation found:', { invitationId: invitation.id, status: invitation.status });
  return { valid: true, invitation };
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
      return new Response(
        JSON.stringify({ success: false, error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
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
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid user token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { token }: AcceptInvitationRequest = await req.json();
    if (!token) {
      console.log('❌ Missing invitation token');
      return new Response(
        JSON.stringify({ success: false, error: 'Missing invitation token' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('🎫 Processing invitation acceptance:', {
      token,
      userEmail: user.email,
      userId: user.id.substring(0, 8) + "..."
    });

    // Get user profile with onboarding status
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('email, onboarding_completed, full_name')
      .eq('id', user.id)
      .single();

    console.log('👤 Profile validation:', {
      profileEmail: profile?.email,
      userEmail: user?.email,
      onboardingCompleted: profile?.onboarding_completed,
      fullName: profile?.full_name,
      profileError: profileError?.message
    });

    if (profileError || !profile) {
      console.log('❌ Profile not found');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'User profile not found',
          requiresProfile: true 
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate email match
    if (profile.email !== user.email) {
      console.log('❌ Email mismatch:', { profileEmail: profile.email, userEmail: user.email });
      return new Response(
        JSON.stringify({ success: false, error: 'Email mismatch' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if onboarding is completed
    if (!profile.onboarding_completed) {
      console.log('⚠️ User needs to complete onboarding');
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Profile onboarding not completed',
          requiresOnboarding: true,
          token: token // Return token to continue flow after onboarding
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate invitation before accepting
    const validationResult = await isValidInvitation(supabaseClient, token, user.email);
    if (!validationResult.valid) {
      console.log('❌ Invalid invitation:', validationResult.error);
      return new Response(
        JSON.stringify({ success: false, error: validationResult.error }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check invitation details for logging
    const { data: invitationCheck, error: checkError } = await supabaseClient
      .from('trip_invitations')
      .select('*')
      .eq('token', token)
      .single();

    console.log('📋 Invitation details:', {
      found: !!invitationCheck,
      email: invitationCheck?.email,
      status: invitationCheck?.status,
      expired: invitationCheck ? new Date(invitationCheck.expires_at) < new Date() : 'unknown',
      userEmail: user.email,
      emailMatch: invitationCheck?.email === user.email
    });

    // Call the database function to accept invitation (atomic transaction)
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
      return new Response(
        JSON.stringify({ success: false, error: 'Failed to accept invitation' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!success) {
      console.log('❌ Database function returned false - invitation invalid/expired');
      return new Response(
        JSON.stringify({ success: false, error: 'Invitation could not be accepted' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get the trip details for the response
    const { data: invitation, error: getError } = await supabaseClient
      .from('trip_invitations')
      .select(`
        role,
        trips:trip_id (id, name, destination, dates, status, is_group_trip)
      `)
      .eq('token', token)
      .eq('status', 'accepted')
      .single();

    console.log('✅ Invitation accepted successfully for trip:', invitation?.trips?.name);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Invitation accepted successfully',
        trip: invitation?.trips || null,
        userRole: invitation?.role,
        onboardingCompleted: true
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