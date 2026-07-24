import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization') } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error("Unauthorized request.")

    if (req.method === 'GET') {
      const { data, error } = await supabase.from('user_preferences').select('*').eq('id', user.id).single()
      if (error && error.code === 'PGRST116') return new Response(JSON.stringify({ preferences: {} }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }})
      if (error) throw error
      return new Response(JSON.stringify({ preferences: data }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }})
    }

    if (req.method === 'PATCH') {
      const updates = await req.json()
      const { data, error } = await supabase.from('user_preferences').upsert({ id: user.id, ...updates, updated_at: new Date().toISOString() }).select().single()
      if (error) throw error
      return new Response(JSON.stringify({ success: true, preferences: data }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }})
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
    return new Response(JSON.stringify({ message: errorMessage }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }})
  }
})