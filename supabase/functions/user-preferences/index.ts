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

    // C2 FIX: invoke() always sends POST. Route on `action` field instead of HTTP method.
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ message: "Method not allowed." }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error("Unauthorized request.")

    const body = await req.json()
    const { action } = body

    // ── GET preferences ────────────────────────────────────────────────────
    if (action === 'get') {
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No row yet — first-time user, return empty so client keeps its defaults
          return new Response(
            JSON.stringify({ preferences: {} }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        throw error
      }

      return new Response(
        JSON.stringify({ preferences: data }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ── UPDATE preferences ─────────────────────────────────────────────────
    if (action === 'update') {
      // C5 FIX: only allow the exact snake_case column names that exist in the DB.
      // Silently ignore any unknown or camelCase keys sent from older client code.
      const ALLOWED_COLUMNS = ['currency', 'language', 'timezone', 'date_format', 'login_alerts']

      const cleanUpdates: Record<string, unknown> = {}
      for (const col of ALLOWED_COLUMNS) {
        if (body[col] !== undefined && body[col] !== null) {
          cleanUpdates[col] = body[col]
        }
      }

      if (Object.keys(cleanUpdates).length === 0) {
        throw new Error("No valid fields to update.")
      }

      const { data, error } = await supabase
        .from('user_preferences')
        // C4 FIX (M4): explicit onConflict so upsert behaviour is unambiguous
        .upsert({ id: user.id, ...cleanUpdates }, { onConflict: 'id' })
        .select()
        .single()

      if (error) throw error

      return new Response(
        JSON.stringify({ success: true, preferences: data }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    throw new Error("Unknown action. Use action: 'get' or 'update'.")
  } catch (error) {
    // FIX #2: Error type safety - handle non-Error objects
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
    return new Response(
      JSON.stringify({ message: errorMessage }), 
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})