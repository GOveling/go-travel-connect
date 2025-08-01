import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AcceptInvitationRequest {
  token: string;
}

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
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Set auth for service role client
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    const { token }: AcceptInvitationRequest = await req.json();

    console.log('Accepting invitation with token:', token);

    // Call the database function to accept invitation
    const { data: success, error: acceptError } = await supabaseClient
      .rpc('accept_trip_invitation', {
        p_token: token
      });

    if (acceptError) {
      console.error('Error accepting invitation:', acceptError);
      throw new Error(`Failed to accept invitation: ${acceptError.message}`);
    }

    if (!success) {
      throw new Error('Invalid or expired invitation token');
    }

    console.log('Invitation accepted successfully');

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