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
    const { token, debug = false, test_id } = await req.json();

    if (!token) {
      const error = 'Le token CAPTCHA est manquant.';
      console.error(`[${test_id || 'unknown'}] Error: ${error}`);
      throw new Error(error);
    }

    // LA CORRECTION CRITIQUE : Utiliser Deno.env.get() pour Supabase
    const secretKey = Deno.env.get('RECAPTCHA_SECRET_KEY');

    if (!secretKey) {
      const error = 'Clé secrète reCAPTCHA non trouvée dans les secrets Supabase.';
      console.error(`[${test_id || 'unknown'}] Server error: ${error}`);
      throw new Error('Configuration du serveur invalide.');
    }

    console.log(`[${test_id || 'unknown'}] Starting CAPTCHA verification...`);

    // Appel à l'API de Google pour vérification
    const verifyUrl = 'https://www.google.com/recaptcha/api/siteverify';
    const body = `secret=${secretKey}&response=${token}`;
    
    if (debug) {
      console.log(`[${test_id}] Verify URL: ${verifyUrl}`);
      console.log(`[${test_id}] Request body length: ${body.length}`);
    }

    const response = await fetch(verifyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });

    if (!response.ok) {
      const error = `Google reCAPTCHA API returned ${response.status}`;
      console.error(`[${test_id || 'unknown'}] ${error}`);
      throw new Error('Erreur de communication avec le service CAPTCHA');
    }

    const data = await response.json();
    
    console.log(`[${test_id || 'unknown'}] Google response:`, JSON.stringify(data));

    // Enhanced validation
    const result = {
      success: data.success,
      score: data.score,
      action: data.action,
      challenge_ts: data.challenge_ts,
      hostname: data.hostname,
      errors: data['error-codes'] || [],
      test_id
    };

    // Additional validation checks
    if (data.success) {
      // Check for minimum score if available (v3)
      if (data.score !== undefined && data.score < 0.5) {
        console.warn(`[${test_id || 'unknown'}] Low score detected: ${data.score}`);
        result.success = false;
        result.errors.push('score-too-low');
      }

      // Check timestamp freshness (within 2 minutes)
      if (data.challenge_ts) {
        const challengeTime = new Date(data.challenge_ts);
        const now = new Date();
        const diffMinutes = (now.getTime() - challengeTime.getTime()) / (1000 * 60);
        
        if (diffMinutes > 2) {
          console.warn(`[${test_id || 'unknown'}] Stale token detected: ${diffMinutes} minutes old`);
          result.success = false;
          result.errors.push('token-expired');
        }
      }

      // Log success with details
      console.log(`[${test_id || 'unknown'}] CAPTCHA verified successfully. Score: ${data.score || 'N/A'}, Action: ${data.action || 'N/A'}`);
    } else {
      console.warn(`[${test_id || 'unknown'}] CAPTCHA verification failed:`, data['error-codes']);
    }

    // Renvoyer le résultat détaillé
    return new Response(JSON.stringify(result), {
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