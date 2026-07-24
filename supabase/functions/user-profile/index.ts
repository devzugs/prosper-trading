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
    // C2 FIX: invoke() always sends POST regardless of the method option.
    // Action-based routing is used instead of HTTP method routing.
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ message: "Method not allowed." }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const authHeader = req.headers.get('Authorization') ?? ''

    // Initialize authenticated client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Verify user session
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) throw new Error("Unauthorized request.")

    const { action, fullName, phone, country, bio, avatar } = await req.json()

    if (action !== 'update') {
      throw new Error("Unknown action. Use action: 'update'.")
    }

    // FIX #3: Input validation - only update fields that are provided and valid
    const updates: Record<string, any> = {}

    if (fullName !== undefined && fullName !== null) {
      if (typeof fullName !== 'string' || fullName.trim().length === 0) {
        throw new Error("Full name must be a non-empty string")
      }
      updates.full_name = fullName.trim()
    }

    if (phone !== undefined && phone !== null) {
      // Validate phone format (basic validation)
      const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
      if (!/^\+?[0-9]{7,15}$/.test(cleanPhone)) {
        throw new Error("Invalid phone number format. Use 7-15 digits with optional + prefix")
      }
      updates.phone = phone.trim()
    }

    if (country !== undefined && country !== null) {
      if (typeof country !== 'string' || country.trim().length === 0) {
        throw new Error("Country must be a non-empty string")
      }
      updates.country = country.trim()
    }

    if (bio !== undefined && bio !== null) {
      if (typeof bio !== 'string') {
        throw new Error("Bio must be a string")
      }
      // Limit bio length to reasonable amount (e.g., 500 characters)
      if (bio.trim().length > 500) {
        throw new Error("Bio must be 500 characters or less")
      }
      updates.bio = bio.trim()
    }

    if (avatar !== undefined && avatar !== null) {
      if (typeof avatar !== 'string' || avatar.trim().length === 0) {
        throw new Error("Avatar URL must be a non-empty string")
      }
      updates.avatar_url = avatar.trim()
    }

    // Only proceed if at least one field is being updated
    if (Object.keys(updates).length === 0) {
      throw new Error("No fields to update")
    }

    updates.updated_at = new Date().toISOString()

    // Update the profiles table
    // Note: RLS policies on the table should be configured to only allow users to update their own rows
    const { data: updatedProfile, error: updateError } = await supabaseClient
      .from('profiles')
      .update(updates)
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
    // FIX #2: Error type safety - handle non-Error objects
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred"
    return new Response(JSON.stringify({ message: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})