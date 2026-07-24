import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    if (req.method !== 'DELETE') {
      throw new Error("Method not allowed. Use DELETE to remove an account.")
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization') } } }
    )

    const { password } = await req.json()
    if (!password) throw new Error("Password confirmation is required for deletion.")

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    if (userError || !user) throw new Error("Unauthorized request.")

    // Verify password via silent sign-in
    const { error: signInError } = await supabaseClient.auth.signInWithPassword({
      email: user.email,
      password: password,
    })

    if (signInError) {
      return new Response(JSON.stringify({ message: "Incorrect password. Deletion aborted." }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Delete the user from Supabase Auth
    // Note: If you have foreign key constraints in your DB tied to auth.users, 
    // ensure they are set to ON DELETE CASCADE, otherwise this will fail.
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id)

    if (deleteError) throw deleteError

    return new Response(JSON.stringify({ success: true, message: "Account permanently deleted." }), {
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