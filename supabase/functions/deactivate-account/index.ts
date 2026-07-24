import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization') } } }
    )

    const { password } = await req.json()
    if (!password) throw new Error("Password confirmation is required.")

    // Verify user session
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) throw new Error("Unauthorized request. Please log in again.")

    // Verify password via silent sign-in
    const { error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: user.email,
      password: password,
    })

    if (signInError) {
      return new Response(JSON.stringify({ message: "Incorrect password." }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Initialize Admin client to bypass RLS for administrative updates
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Update the profile to indicate deactivation status
    // Ensure your `profiles` table has an `is_deactivated` boolean column
    const { error: updateError } = await supabaseAdmin
      .from('profiles')
      .update({ is_deactivated: true, updated_at: new Date().toISOString() })
      .eq('id', user.id)

    if (updateError) throw updateError

    return new Response(JSON.stringify({ success: true, message: "Account deactivated successfully." }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
    return new Response(JSON.stringify({ message: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})