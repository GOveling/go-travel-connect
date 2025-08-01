import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DeclineInvitationRequest {
  token: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log('🔽 Decline invitation request received');

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('❌ No authorization header');
      return new Response(JSON.stringify({ success: false, error: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Extract the JWT token
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);

    if (authError || !user) {
      console.log('❌ Authentication failed:', authError?.message);
      return new Response(JSON.stringify({ success: false, error: 'Invalid authentication' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Parse request body
    const { token }: DeclineInvitationRequest = await req.json();

    if (!token) {
      console.log('❌ Missing token in request');
      return new Response(JSON.stringify({ success: false, error: 'Token is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('🔍 Looking for invitation with token:', token.substring(0, 10) + '...');

    // Get user's email for validation
    const { data: profile } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();

    if (!profile?.email) {
      console.log('❌ User profile not found');
      return new Response(JSON.stringify({ success: false, error: 'User profile not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Find the invitation
    const { data: invitation, error: invitationError } = await supabase
      .from('trip_invitations')
      .select('*')
      .eq('token', token)
      .eq('email', profile.email)
      .eq('status', 'pending')
      .single();

    if (invitationError || !invitation) {
      console.log('❌ Invitation not found or not valid:', invitationError?.message);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invitation not found or not valid for this user' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // Check if invitation is expired
    const expiresAt = new Date(invitation.expires_at);
    const now = new Date();
    
    if (now > expiresAt) {
      console.log('❌ Invitation has expired');
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invitation has expired' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('✅ Valid invitation found, declining...');

    // Update invitation status to declined
    const { error: updateError } = await supabase
      .from('trip_invitations')
      .update({ 
        status: 'declined',
        updated_at: new Date().toISOString()
      })
      .eq('id', invitation.id);

    if (updateError) {
      console.error('❌ Error updating invitation:', updateError);
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Failed to decline invitation' 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    console.log('✅ Invitation declined successfully');

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Invitation declined successfully' 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error: any) {
    console.error('❌ Error in decline-trip-invitation function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
};

serve(handler);