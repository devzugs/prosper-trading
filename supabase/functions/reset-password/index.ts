import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  // FIX #7: Improved CORS preflight response
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      }
    })
  }

  try {
    const { token, newPassword, newPasswordConfirm } = await req.json()

    if (!token) throw new Error("Missing recovery token.")
    if (newPassword !== newPasswordConfirm) throw new Error("Passwords do not match.")
    if (newPassword.length < 8) throw new Error("Password must be at least 8 characters.")

    // Bug fix #8: recovery tokens from Supabase email links are OTP codes, not raw JWTs.
    // They must be exchanged for a real session first via exchangeCodeForSession,
    // not passed directly as a Bearer token (which fails for OTP-type tokens).
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { data: sessionData, error: exchangeError } = await supabaseClient.auth.exchangeCodeForSession(token)
    if (exchangeError || !sessionData?.user) {
      throw new Error("Invalid or expired recovery token. Please request a new link.")
    }

    const user = sessionData.user

    // Initialize Admin client to bypass RLS and force the password update
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    )

    if (updateError) throw updateError

    return new Response(JSON.stringify({ success: true, message: "Password reset successfully." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    // FIX #2: Error type safety - handle non-Error objects
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
    return new Response(JSON.stringify({ message: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})