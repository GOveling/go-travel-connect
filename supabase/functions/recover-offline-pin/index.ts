import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RecoverPinRequest {
  userEmail: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userEmail }: RecoverPinRequest = await req.json();

    if (!userEmail) {
      throw new Error("Email del usuario es requerido");
    }

    // Generate a recovery token
    const recoveryToken = crypto.randomUUID();
    const expirationTime = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Store recovery token in database
    const { error: insertError } = await supabase
      .from('pin_recovery_tokens')
      .insert({
        user_email: userEmail,
        recovery_token: recoveryToken,
        expires_at: expirationTime.toISOString(),
        used: false
      });

    if (insertError) {
      console.error("Error storing recovery token:", insertError);
      throw new Error("Error al procesar solicitud de recuperación");
    }

    // Send recovery email
    const recoveryUrl = `${req.headers.get('origin') || 'https://go-travel-connect.vercel.app'}/recover-pin?token=${recoveryToken}`;
    
    const emailResponse = await resend.emails.send({
      from: "Travel Connect <onboarding@resend.dev>",
      to: [userEmail],
      subject: "Recuperación de PIN - Travel Connect",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #1f2937; border-bottom: 2px solid #3b82f6; padding-bottom: 10px;">
            🔐 Recuperación de PIN
          </h1>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Hola,
          </p>
          
          <p style="color: #374151; font-size: 16px; line-height: 1.6;">
            Hemos recibido una solicitud para recuperar tu PIN de modo offline en Travel Connect.
          </p>
          
          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="color: #92400e; margin: 0; font-weight: 600;">
              ⚠️ <strong>Importante:</strong> Al usar este enlace, tu PIN actual será eliminado y podrás crear uno nuevo.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${recoveryUrl}" 
               style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Recuperar PIN
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            Este enlace expirará en 24 horas. Si no solicitaste esta recuperación, puedes ignorar este email.
          </p>
          
          <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
            Si tienes problemas con el botón, copia y pega este enlace en tu navegador:<br>
            <span style="word-break: break-all;">${recoveryUrl}</span>
          </p>
          
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
          
          <p style="color: #9ca3af; font-size: 12px; text-align: center;">
            Travel Connect - Tus documentos de viaje seguros
          </p>
        </div>
      `,
    });

    console.log("Recovery email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Email de recuperación enviado correctamente" 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in recover-offline-pin function:", error);
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