import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.js"

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization') } } }
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
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }})
  }
})