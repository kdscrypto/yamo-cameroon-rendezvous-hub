
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configuration de sécurité
const SECURITY_CONFIG = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES_PER_REQUEST: 5,
  MAX_UPLOADS_PER_HOUR: 50, // Par utilisateur
  ALLOWED_MIME_TYPES: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.txt', '.doc', '.docx']
}

// Fonction pour valider le type MIME réel du fichier
function validateMimeType(fileBuffer: Uint8Array, fileName: string): boolean {
  const fileSignatures = {
    // Images
    'ffd8ff': 'image/jpeg',
    '89504e47': 'image/png', 
    '47494638': 'image/gif',
    '52494646': 'image/webp',
    // PDF
    '25504446': 'application/pdf',
    // Documents Word
    'd0cf11e0': 'application/msword',
    '504b0304': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  }

  // Vérifier les 4 premiers octets
  const header = Array.from(fileBuffer.slice(0, 4))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  // Cas spécial pour WebP (vérifier plus d'octets)
  if (header === '52494646') {
    const webpHeader = Array.from(fileBuffer.slice(8, 12))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
    if (webpHeader === '57454250') {
      return true
    }
  }

  // Vérifier si la signature correspond
  for (const [signature, mimeType] of Object.entries(fileSignatures)) {
    if (header.startsWith(signature)) {
      return SECURITY_CONFIG.ALLOWED_MIME_TYPES.includes(mimeType)
    }
  }

  // Pour les fichiers texte, vérifier qu'ils ne contiennent que du texte ASCII/UTF-8
  if (fileName.endsWith('.txt')) {
    try {
      const text = new TextDecoder('utf-8', { fatal: true }).decode(fileBuffer.slice(0, 1024))
      return /^[\x20-\x7E\s\r\n\t]*$/u.test(text) || /^[\u0000-\u007F\u0080-\uFFFF]*$/u.test(text)
    } catch {
      return false
    }
  }

  return false
}

// Fonction pour générer un nom de fichier sécurisé
function generateSecureFileName(originalName: string, userId: string): string {
  const extension = originalName.substring(originalName.lastIndexOf('.'))
  const timestamp = Date.now()
  const randomBytes = crypto.getRandomValues(new Uint8Array(16))
  const randomString = Array.from(randomBytes, byte => byte.toString(16).padStart(2, '0')).join('')
  const hash = btoa(userId + timestamp + randomString).replace(/[+/=]/g, '').substring(0, 16)
  
  return `${timestamp}-${hash}${extension}`
}

// Rate limiting simple en mémoire (à améliorer avec Redis en production)
const uploadTracking = new Map<string, number[]>()

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const hourAgo = now - (60 * 60 * 1000)
  
  if (!uploadTracking.has(userId)) {
    uploadTracking.set(userId, [])
  }
  
  const userUploads = uploadTracking.get(userId)!
  // Nettoyer les anciens uploads
  const recentUploads = userUploads.filter(time => time > hourAgo)
  uploadTracking.set(userId, recentUploads)
  
  return recentUploads.length < SECURITY_CONFIG.MAX_UPLOADS_PER_HOUR
}

function recordUpload(userId: string): void {
  const uploads = uploadTracking.get(userId) || []
  uploads.push(Date.now())
  uploadTracking.set(userId, uploads)
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Secure file upload function called')
    
    // Vérifier l'authentification
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.log('No auth header found')
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Unauthorized' 
      }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Vérifier l'utilisateur
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.log('Auth error:', authError)
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Unauthorized' 
      }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    console.log('User authenticated:', user.id)

    // Vérifier le rate limiting
    if (!checkRateLimit(user.id)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Too many uploads. Please wait.' 
      }), { 
        status: 429, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Traiter la requête multipart
    const formData = await req.formData()
    const files = formData.getAll('files') as File[]

    if (!files || files.length === 0) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'No files provided' 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    if (files.length > SECURITY_CONFIG.MAX_FILES_PER_REQUEST) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Too many files. Maximum ${SECURITY_CONFIG.MAX_FILES_PER_REQUEST} allowed.` 
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const uploadResults = []

    for (const file of files) {
      console.log('Processing file:', file.name, 'Size:', file.size)
      
      // Vérifier la taille
      if (file.size > SECURITY_CONFIG.MAX_FILE_SIZE) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: `File ${file.name} is too large. Maximum ${SECURITY_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB allowed.` 
        }), { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Vérifier l'extension
      const extension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase()
      if (!SECURITY_CONFIG.ALLOWED_EXTENSIONS.includes(extension)) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: `File type ${extension} not allowed for ${file.name}` 
        }), { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Lire le contenu du fichier pour validation
      const fileBuffer = new Uint8Array(await file.arrayBuffer())

      // Valider le type MIME réel
      if (!validateMimeType(fileBuffer, file.name)) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: `Invalid file content for ${file.name}. File content doesn't match extension.` 
        }), { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Générer un nom de fichier sécurisé
      const secureFileName = generateSecureFileName(file.name, user.id)
      const filePath = `${user.id}/${secureFileName}`

      console.log('Uploading to path:', filePath)

      // Upload vers Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('message-attachments')
        .upload(filePath, fileBuffer, {
          contentType: file.type,
          upsert: false
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        return new Response(JSON.stringify({ 
          success: false, 
          error: `Failed to upload ${file.name}: ${uploadError.message}` 
        }), { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('message-attachments')
        .getPublicUrl(filePath)

      uploadResults.push({
        url: publicUrl,
        name: file.name,
        type: file.type,
        size: file.size,
        secureName: secureFileName
      })

      console.log('File uploaded successfully:', file.name)
    }

    // Enregistrer l'upload pour le rate limiting
    recordUpload(user.id)

    console.log('All files uploaded successfully:', uploadResults.length)

    return new Response(JSON.stringify({ 
      success: true, 
      files: uploadResults 
    }), {
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json' 
      }
    })

  } catch (error) {
    console.error('Server error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Internal server error' 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
