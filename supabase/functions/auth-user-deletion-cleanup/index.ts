import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
  type: string;
  table: string;
  record?: any;
  schema: string;
  old_record?: any;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Verify the webhook secret
    const expectedSecret = Deno.env.get('AUTH_HOOK_SECRET');
    if (!expectedSecret) {
      console.log('AUTH_HOOK_SECRET not configured');
      return new Response(
        JSON.stringify({ error: 'Webhook secret not configured' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    // Simple bearer token check
    const providedSecret = authHeader.replace('Bearer ', '');
    if (providedSecret !== expectedSecret) {
      console.log('Invalid webhook secret');
      return new Response(
        JSON.stringify({ error: 'Invalid authorization' }),
        { 
          status: 401, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    const payload: WebhookPayload = await req.json();
    console.log('Webhook received:', { type: payload.type, table: payload.table });

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Handle user deletion cleanup
    if (payload.type === 'DELETE' && payload.table === 'users' && payload.old_record) {
      const userId = payload.old_record.id;
      console.log('Cleaning up data for deleted user:', userId);

      try {
        // Clean up user-related data
        const { error: cleanupError } = await supabase.rpc('handle_user_deletion', {
          user_id: userId
        });

        if (cleanupError) {
          console.error('Error during cleanup:', cleanupError);
          // Don't fail the webhook, just log the error
        } else {
          console.log('Successfully cleaned up user data for:', userId);
        }
      } catch (error) {
        console.error('Exception during cleanup:', error);
        // Don't fail the webhook, just log the error
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed successfully' }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );

  } catch (error: any) {
    console.error('Error in auth webhook:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
};

serve(handler);