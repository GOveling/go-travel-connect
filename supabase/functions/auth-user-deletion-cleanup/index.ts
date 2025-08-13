import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log('🗑️ auth-user-deletion-cleanup: Webhook called (will be removed)')
    
    // This function is temporary - just return success to prevent 404 errors
    // The webhook should be removed from the Supabase dashboard
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Temporary function - webhook should be removed' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('❌ auth-user-deletion-cleanup error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Return 200 to prevent webhook errors
      },
    )
  }
})