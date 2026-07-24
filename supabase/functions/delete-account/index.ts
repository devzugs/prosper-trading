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

    // C2 FIX: lock to POST only
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ message: 'Method not allowed.' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify user session first so we never expose a 'password required' hint to unauthenticated callers
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) throw new Error("Unauthorized request. Please log in again.")

    // C2 FIX: accept action field from client; password is always required
    const { password } = await req.json()
    if (!password) throw new Error("Password confirmation is required.")

    // Verify password via silent sign-in
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

    // Initialize Admin client to perform account deletion
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Delete user from auth
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (deleteError) throw deleteError

    return new Response(JSON.stringify({ success: true, message: "Account deleted successfully." }), {
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