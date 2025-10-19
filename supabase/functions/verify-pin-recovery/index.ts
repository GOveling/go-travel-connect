import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerifyRecoveryRequest {
  recoveryToken: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { recoveryToken }: VerifyRecoveryRequest = await req.json();

    if (!recoveryToken) {
      throw new Error("Token de recuperación es requerido");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify recovery token
    const { data: tokenData, error: selectError } = await supabase
      .from('pin_recovery_tokens')
      .select('*')
      .eq('recovery_token', recoveryToken)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .single();

    if (selectError || !tokenData) {
      throw new Error("Token de recuperación inválido o expirado");
    }

    // Mark token as used
    const { error: updateError } = await supabase
      .from('pin_recovery_tokens')
      .update({ used: true })
      .eq('recovery_token', recoveryToken);

    if (updateError) {
      console.error("Error marking token as used:", updateError);
      throw new Error("Error al procesar token de recuperación");
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Token verificado correctamente",
      userEmail: tokenData.user_email
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in verify-pin-recovery function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "Error interno del servidor" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);