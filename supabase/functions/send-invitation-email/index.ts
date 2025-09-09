import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendInvitationEmailRequest {
  invitationId: string;
  tripName: string;
  inviterName: string;
  email: string;
  role: string;
  token: string;
}

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      invitationId,
      tripName,
      inviterName,
      email,
      role,
      token,
    }: SendInvitationEmailRequest = await req.json();

    console.log("Sending invitation email:", {
      invitationId,
      tripName,
      inviterName,
      email,
      role,
    });

    // Get correct domain from request headers or use current Lovable domain
    const origin = req.headers.get("origin") || req.headers.get("referer");
    let baseUrl =
      "https://bc24aefb-3820-4bdb-bbd4-aa7d5ea01cf8.lovableproject.com"; // Current Lovable domain

    if (origin) {
      try {
        const url = new URL(origin);
        baseUrl = url.origin;
        console.log("Using origin from request:", baseUrl);
      } catch (e) {
        console.log("Invalid origin URL, using default:", origin);
      }
    }

    const invitationLink = `${baseUrl}/accept-invitation?token=${token}`;
    console.log("Generated invitation link for email:", invitationLink);

    const roleText =
      role === "editor" ? "colaborador con permisos de edición" : "observador";

    const emailResponse = await resend.emails.send({
      from: "GoVeling <info@team.goveling.com>",
      to: [email],
      subject: `Invitación a ${tripName} - GoVeling`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #7c3aed; margin: 0;">GoVeling</h1>
            <p style="color: #6b7280; margin: 5px 0;">Travel Smart. Travel More</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #7c3aed, #f97316); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
            <h2 style="color: white; margin: 0 0 10px 0;">¡Te han invitado a un viaje!</h2>
            <p style="color: white; margin: 0; opacity: 0.9;">Únete a la planificación de ${tripName}</p>
          </div>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
            <p style="margin: 0 0 10px 0;"><strong>Viaje:</strong> ${tripName}</p>
            <p style="margin: 0 0 10px 0;"><strong>Invitado por:</strong> ${inviterName}</p>
            <p style="margin: 0;"><strong>Rol:</strong> ${roleText}</p>
          </div>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="${invitationLink}" 
               style="background: linear-gradient(135deg, #7c3aed, #f97316); 
                      color: white; 
                      text-decoration: none; 
                      padding: 12px 30px; 
                      border-radius: 8px; 
                      display: inline-block;
                      font-weight: bold;">
              Unirse al Viaje
            </a>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; color: #6b7280; font-size: 14px;">
            <p>Si no puedes hacer clic en el botón, copia y pega este enlace en tu navegador:</p>
            <p style="word-break: break-all; color: #7c3aed;">${invitationLink}</p>
            <p style="margin-top: 20px;">Esta invitación expira en 7 días.</p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({
        success: true,
        emailId: emailResponse.data?.id,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error sending invitation email:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  }
});
