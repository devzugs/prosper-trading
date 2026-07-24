import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"
import { Resend } from "npm:resend"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email } = await req.json()
    
    if (!email) throw new Error("Email address is required.")

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const redirectUrl = `${Deno.env.get('FRONTEND_URL') || 'https://localhost:5173'}/reset-password`

    // Generate and dispatch the secure recovery token via Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: {
        redirectTo: redirectUrl,
      },
    });

    if (error) throw error;

    const resetLink = data.properties.action_link;

    const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

    // Send the email BEFORE returning the successful response
    await resend.emails.send({
      from: "Admin <noreply@prospertrading.pro>",
      to: email,
      subject: "Reset your Prosper Trading password",
      html: `
        <h2>Reset your password</h2>
        <p>We received a request to reset your password.</p>
        <p>
          <a href="${resetLink}">
            Reset Password
          </a>
        </p>
        <p>This link expires automatically.</p>
      `,
    });

    return new Response(JSON.stringify({ success: true, message: "Check your email for the reset link." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
    return new Response(JSON.stringify({ message: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});