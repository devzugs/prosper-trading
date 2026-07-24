import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { corsHeaders } from "../_shared/cors.ts"

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Only accept PATCH for profile updates based on your architecture plan
    if (req.method !== 'PATCH') {
      throw new Error("Method not allowed. Use PATCH to update profile.")
    }

    // Initialize authenticated client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization') } } }
    )

    // Verify user session
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) throw new Error("Unauthorized request.")

    const { fullName, phone, country, bio, avatar } = await req.json()

    // Update the profiles table
    // Note: RLS policies on the table should be configured to only allow users to update their own rows
    const { data: updatedProfile, error: updateError } = await supabaseClient
      .from('profiles')
      .update({
        full_name: fullName,
        phone: phone,
        country: country,
        bio: bio,
        avatar_url: avatar,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) throw updateError

    return new Response(JSON.stringify({ 
      success: true, 
      user: updatedProfile,
      message: "Profile updated successfully." 
    }), {
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