
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TestEmailRequest {
  email: string;
  mode: 'validate' | 'test-send';
}

interface ValidationResult {
  isValid: boolean;
  reason?: string;
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];
}

// Validation avancée d'emails
const validateEmail = (email: string): ValidationResult => {
  const result: ValidationResult = {
    isValid: true,
    riskLevel: 'low',
    riskFactors: []
  };

  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      reason: "L'email ne peut pas être vide",
      riskLevel: 'high',
      riskFactors: ["Email vide"]
    };
  }

  email = email.trim().toLowerCase();

  // Vérification de base avec regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      reason: "Format d'email invalide",
      riskLevel: 'high',
      riskFactors: ["Format non conforme aux standards"]
    };
  }

  // Analyse du domaine
  const domain = email.split('@')[1];
  
  // Liste de domaines problématiques
  const disposableEmailDomains = [
    '10minutemail.com',
    'guerrillamail.com',
    'mailinator.com',
    'tempmail.org',
    'temp-mail.org',
    'throwaway.email',
    'yopmail.com'
  ];
  
  const problematicDomains = [
    'example.com',
    'test.com',
    'localhost'
  ];

  // Vérifications du risque
  if (disposableEmailDomains.includes(domain)) {
    result.isValid = false;
    result.reason = "Les emails temporaires ne sont pas acceptés";
    result.riskLevel = 'high';
    result.riskFactors.push("Service d'email temporaire");
    return result;
  }
  
  if (problematicDomains.includes(domain)) {
    result.isValid = false;
    result.reason = "Ce domaine email n'est pas accepté";
    result.riskLevel = 'high';
    result.riskFactors.push("Domaine non valide pour l'envoi d'emails");
    return result;
  }

  // Vérifier les caractères répétés (souvent des erreurs de frappe)
  const repeatedCharsRegex = /(.)\1{4,}/;
  if (repeatedCharsRegex.test(email.split('@')[0])) {
    result.riskFactors.push("Caractères répétés (possible erreur de frappe)");
    result.riskLevel = 'medium';
  }

  // Email avec trop de chiffres consécutifs (souvent des comptes temporaires)
  const numericalRegex = /\d{4,}/;
  if (numericalRegex.test(email)) {
    result.riskFactors.push("Séquence numérique longue (possible compte automatisé)");
    if (result.riskLevel === 'low') result.riskLevel = 'medium';
  }

  return result;
};

// Fonction pour envoyer un email de test avec domaine vérifié
const sendTestEmail = async (email: string): Promise<{
  success: boolean;
  id?: string;
  error?: string;
}> => {
  try {
    const emailResponse = await resend.emails.send({
      from: "Test Yamo <noreply@yamo.chat>",
      to: [email],
      subject: "Test de délivrabilité d'email - Yamo",
      html: `
        <h2>Test de délivrabilité d'email</h2>
        <p>Cet email est un test automatique pour vérifier la validité de votre adresse email.</p>
        <p>Si vous recevez ce message, cela signifie que votre adresse email est valide et peut recevoir des messages de notre part.</p>
        <p><strong>Domaine d'envoi:</strong> yamo.chat</p>
        <hr>
        <p><em>Message envoyé depuis le système de test Yamo</em></p>
        <p>Date et heure: ${new Date().toISOString()}</p>
      `
    });

    return {
      success: true,
      id: emailResponse.id
    };
  } catch (error: any) {
    console.error("Erreur lors de l'envoi de l'email de test:", error);
    return {
      success: false,
      error: error.message
    };
  }
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, mode }: TestEmailRequest = await req.json();
    
    // Valider l'email
    const validationResult = validateEmail(email);
    
    // Si mode=validate, retourner seulement le résultat de validation
    if (mode === 'validate') {
      return new Response(JSON.stringify(validationResult), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }
    
    // Si mode=test-send, envoyer un email de test
    if (mode === 'test-send') {
      // Si email est à haut risque, on ne tente pas l'envoi
      if (validationResult.riskLevel === 'high') {
        return new Response(JSON.stringify({
          success: false,
          validationResult,
          message: "Email non envoyé car il présente un risque élevé de bounce"
        }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            ...corsHeaders,
          },
        });
      }
      
      // Sinon, on tente l'envoi
      const sendResult = await sendTestEmail(email);
      
      // Enregistrer dans le tracking email
      if (sendResult.success && sendResult.id) {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );
        
        await supabase.from('email_tracking').insert({
          email_address: email.toLowerCase(),
          email_type: 'test_email',
          status: 'sent',
          provider: 'resend',
          metadata: {
            email_id: sendResult.id,
            test_mode: true,
            from: 'noreply@yamo.chat',
            validation_result: validationResult
          }
        });
      }
      
      return new Response(JSON.stringify({
        ...sendResult,
        validationResult,
        customDomain: "yamo.chat"
      }), {
        status: sendResult.success ? 200 : 500,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      });
    }
    
    // Mode non reconnu
    return new Response(
      JSON.stringify({ error: "Mode non reconnu. Utilisez 'validate' ou 'test-send'." }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in test-email-delivery function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
