import React from 'npm:react@18.3.1';
import { Webhook } from 'https://esm.sh/standardwebhooks@1.0.0';
import { Resend } from 'npm:resend@4.0.0';
import { renderAsync } from 'npm:@react-email/components@0.0.22';
import { WelcomeEmail } from './_templates/welcome-email.tsx';
import { PasswordResetEmail } from './_templates/password-reset-email.tsx';
import { MagicLinkEmail } from './_templates/magic-link-email.tsx';
import { EmailConfirmationEmail } from './_templates/email-confirmation.tsx';

const resend = new Resend(Deno.env.get('RESEND_API_KEY') as string);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const payload = await req.text();
    
    // Parse the webhook payload
    const webhookData = JSON.parse(payload);
    console.log('Webhook data received:', webhookData);

    // Ensure Resend API key is configured
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (!resendApiKey) {
      console.error('RESEND_API_KEY is not set in Edge Function secrets.');
      return new Response(
        JSON.stringify({ error: 'Missing RESEND_API_KEY secret' }),
        { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    const { user, email_data } = webhookData;
    
    if (!user || !user.email) {
      console.error('No user email found in webhook');
      return new Response('No user email found', { status: 400 });
    }

    const {
      token,
      token_hash,
      redirect_to,
      email_action_type,
      site_url
    } = email_data;

    let html: string;
    let subject: string;

    // Determine email type and render appropriate template
    switch (email_action_type) {
      case 'signup':
      case 'email_change_confirm_new':
        html = await renderAsync(
          React.createElement(EmailConfirmationEmail, {
            userEmail: user.email,
            confirmationUrl: `${site_url}/auth/confirm?token_hash=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`,
            token
          })
        );
        subject = email_action_type === 'signup' 
          ? '¡Bienvenido! Confirma tu cuenta en Travel Connect'
          : 'Confirma tu nuevo email en Travel Connect';
        break;

      case 'recovery':
        html = await renderAsync(
          React.createElement(PasswordResetEmail, {
            userEmail: user.email,
            resetUrl: `${site_url}/auth/reset-password?token_hash=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`,
            token
          })
        );
        subject = 'Restablece tu contraseña en Travel Connect';
        break;

      case 'magiclink':
        html = await renderAsync(
          React.createElement(MagicLinkEmail, {
            userEmail: user.email,
            magicLinkUrl: `${site_url}/auth/confirm?token_hash=${token_hash}&type=${email_action_type}&redirect_to=${redirect_to}`,
            token
          })
        );
        subject = 'Tu enlace mágico para acceder a Travel Connect';
        break;

      case 'invite':
        // For new user welcome after successful signup confirmation
        html = await renderAsync(
          React.createElement(WelcomeEmail, {
            userEmail: user.email,
            appUrl: site_url
          })
        );
        subject = '¡Bienvenido a Travel Connect! Tu aventura comienza aquí';
        break;

      default:
        console.log(`Unhandled email action type: ${email_action_type}`);
        return new Response('Unhandled email type', { status: 400 });
    }

    // Send email via Resend
    const { data, error } = await resend.emails.send({
      from: 'Travel Connect <onboarding@resend.dev>',
      to: [user.email],
      subject,
      html,
    });

    if (error) {
      console.error('Error sending email:', error);
      return new Response(
        JSON.stringify({ error: error.message }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json', ...corsHeaders },
        }
      );
    }

    console.log('Email sent successfully:', data);

    return new Response(
      JSON.stringify({ success: true, messageId: data?.id }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in auth-emails function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});