import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // C2 FIX: invoke() always sends POST — reject every other method up front
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ message: 'Method not allowed.' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const authHeader = req.headers.get('Authorization') ?? ''

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) throw new Error("Unauthorized.")

    // C2 FIX: route on action field in the body — not HTTP method
    const body = await req.json().catch(() => ({}))
    const { action, sessionId } = body

    // ── List active sessions ─────────────────────────────────────────────────────
    if (action === 'list') {
      const { data, error } = await supabaseClient
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .is('revoked_at', null)
      if (error) throw error
      return new Response(
        JSON.stringify({ sessions: data || [] }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ── Revoke a session ────────────────────────────────────────────────────
    if (action === 'revoke') {
      if (!sessionId) throw new Error("sessionId is required to revoke a session.")
      const { error } = await supabaseClient
        .from('user_sessions')
        .update({ revoked_at: new Date().toISOString() })
        .eq('id', sessionId)
        .eq('user_id', user.id)
      if (error) throw error
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error("Unknown action. Use action: 'list' or 'revoke'.")

  } catch (error) {
    // FIX 1: Type-check the error before accessing .message
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
    
    return new Response(JSON.stringify({ message: errorMessage }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})