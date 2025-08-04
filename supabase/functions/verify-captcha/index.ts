// supabase/functions/verify-captcha/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Ajout des en-têtes CORS pour autoriser les requêtes depuis le navigateur
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Gérer la requête de pré-vérification (preflight) CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { token } = await req.json();

    if (!token) {
      throw new Error('Le token CAPTCHA est manquant.');
    }

    // LA CORRECTION CRITIQUE : Utiliser Deno.env.get() pour Supabase
    const secretKey = Deno.env.get('RECAPTCHA_SECRET_KEY');

    if (!secretKey) {
      console.error('Clé secrète reCAPTCHA non trouvée dans les secrets Supabase.');
      throw new Error('Configuration du serveur invalide.');
    }

    // Appel à l'API de Google pour vérification
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const data = await response.json();

    // Renvoyer le succès de la validation
    return new Response(JSON.stringify({ success: data.success }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});