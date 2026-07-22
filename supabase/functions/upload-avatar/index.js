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

    const formData = await req.formData()
    const file = formData.get('file')
    if (!file || !file.type.startsWith('image/')) throw new Error("Invalid file upload.")

    const filePath = `${user.id}/avatar-${Date.now()}.${file.name.split('.').pop()}`
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true })
    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)
    return new Response(JSON.stringify({ success: true, avatarUrl: publicUrl }), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }})
  } catch (error) {
    return new Response(JSON.stringify({ message: error.message }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }})
  }
})