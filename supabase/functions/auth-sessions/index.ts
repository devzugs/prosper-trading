import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // FIX 3: Safely handle potentially null Authorization header
    const authHeader = req.headers.get('Authorization') ?? ''
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error("Unauthorized.")

    const sessionId = new URL(req.url).pathname.split('/').pop()

    if (req.method === 'GET') {
      const { data, error } = await supabase.from('user_sessions').select('*').eq('user_id', user.id).is('revoked_at', null)
      if (error) throw error
      return new Response(JSON.stringify({ sessions: data || [] }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }})
    }

    if (req.method === 'DELETE' && sessionId) {
      const { error } = await supabase.from('user_sessions').update({ revoked_at: new Date().toISOString() }).eq('id', sessionId).eq('user_id', user.id)
      if (error) throw error
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }})
    }

    // FIX 2: Catch-all return for unsupported HTTP methods (e.g., POST, PUT)
    return new Response(JSON.stringify({ message: "Method Not Allowed" }), { 
      status: 405, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    // FIX 1: Type-check the error before accessing .message
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
    
    return new Response(JSON.stringify({ message: errorMessage }), { 
      status: 400, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})