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
    // FIX #1: Authorization header null handling - ensure header is always a string
    const authHeader = req.headers.get('Authorization') ?? ''

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Verify user session first (applies to both actions)
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) throw new Error("Unauthorized request. Please log in again.")

    const { action, password } = await req.json()

    // Initialize Admin client (needed for both deactivate and reactivate)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // ── REACTIVATE ──────────────────────────────────────────────────────────────
    // C3 FIX: reactivate-account function didn't exist; handle reactivation here.
    if (action === 'reactivate') {
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ is_deactivated: false, updated_at: new Date().toISOString() })
        .eq('id', user.id)
      if (updateError) throw updateError

      return new Response(JSON.stringify({ success: true, message: "Account reactivated successfully." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // ── DEACTIVATE ─────────────────────────────────────────────────────────────
    if (action === 'deactivate' || !action) {
      if (!password) throw new Error("Password confirmation is required.")

      // Verify password before deactivating
      const { error: signInError } = await supabaseClient.auth.signInWithPassword({
        email: user.email ?? '',
        password,
      })
      if (signInError) {
        return new Response(JSON.stringify({ message: "Incorrect password." }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // C4 FIX: is_deactivated column added via migration — set it here
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({ is_deactivated: true, updated_at: new Date().toISOString() })
        .eq('id', user.id)
      if (updateError) throw updateError

      // Revoke the user's active sessions immediately
      await supabaseAdmin.auth.admin.signOut(user.id, 'global')

      return new Response(JSON.stringify({ success: true, message: "Account deactivated successfully." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    throw new Error("Unknown action. Use action: 'deactivate' or 'reactivate'.")
  } catch (error) {
    // FIX #2: Error type safety - handle non-Error objects
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
    return new Response(JSON.stringify({ message: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})