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

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) throw new Error("Unauthorized.")

    const formData = await req.formData()
    const file = formData.get('file')

    // Bug fix #5: narrow to File — check for Blob with a name (File extends Blob)
    // instanceof File is unreliable in Deno edge runtime; this check is safe across all envs
    if (!file || !(file instanceof Blob) || typeof (file as Blob & { name?: string }).name !== 'string') {
      throw new Error("File is required and must be a file upload.")
    }
    const uploadFile = file as Blob & { name: string; type: string }
    
    // FIX #5: File size validation
    const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
    if (uploadFile.size > MAX_FILE_SIZE) {
      const sizeMB = (uploadFile.size / 1024 / 1024).toFixed(2)
      throw new Error(`File size must be under 5MB. Got ${sizeMB}MB`)
    }

    // FIX #6: MIME type validation
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!validImageTypes.includes(uploadFile.type)) {
      throw new Error("Invalid image type. Allowed: JPEG, PNG, WebP, GIF")
    }

    // FIX #6: Validate file extension matches MIME type
    const fileName = uploadFile.name.toLowerCase()
    const fileExtension = fileName.substring(fileName.lastIndexOf('.'))

    const validExtensions: Record<string, string[]> = {
      'image/jpeg': ['.jpg', '.jpeg', '.jpe'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/gif': ['.gif']
    }

    const allowedExtensions = validExtensions[uploadFile.type] || []
    if (!allowedExtensions.some(ext => fileExtension === ext)) {
      throw new Error(`File extension ${fileExtension} doesn't match type ${uploadFile.type}`)
    }

    // Bug fix #6: delete the previous avatar so old files don't accumulate in storage
    const { data: profileData } = await supabase
      .from('profiles')
      .select('avatar_url')
      .eq('id', user.id)
      .single()

    if (profileData?.avatar_url) {
      // Extract the storage path from the public URL
      // Public URLs look like: <SUPABASE_URL>/storage/v1/object/public/avatars/<path>
      const urlParts = profileData.avatar_url.split('/avatars/')
      if (urlParts.length === 2) {
        const oldPath = urlParts[1]
        await supabase.storage.from('avatars').remove([oldPath])
      }
    }

    const filePath = `${user.id}/avatar-${Date.now()}${fileExtension}`
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, uploadFile, { upsert: true })
    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath)
    
    return new Response(
      JSON.stringify({ success: true, avatarUrl: publicUrl }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
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