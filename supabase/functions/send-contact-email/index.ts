
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  clientId?: string;
}

// Configuration de sécurité améliorée
const SECURITY_CONFIG = {
  // Domaines email problématiques à rejeter
  BLOCKED_DOMAINS: [
    'example.com',
    'test.com',
    'localhost',
    'tempmail.com',
    '10minutemail.com',
    'guerrillamail.com',
    'mailinator.com',
    'throwaway.email',
    'temp-mail.org',
    'yopmail.com',
    'sharklasers.com',
    'guerrillamailblock.com',
  ],
  
  // Limites de validation
  MAX_EMAIL_LENGTH: 254,
  MAX_NAME_LENGTH: 100,
  MAX_SUBJECT_LENGTH: 200,
  MAX_MESSAGE_LENGTH: 5000,
  
  // Mots-clés de spam
  SPAM_KEYWORDS: [
    'viagra', 'casino', 'lottery', 'winner', 'congratulations',
    'free money', 'click here', 'act now', 'limited time', 'urgent'
  ],
  
  // Rate limiting par IP (simulé)
  RATE_LIMIT: {
    maxEmails: 5,
    timeWindow: 3600000, // 1 heure
  }
};

// Store pour le rate limiting (en mémoire pour cette démo)
const emailAttempts = new Map<string, { count: number; firstAttempt: number }>();

// Fonction de validation d'email améliorée
const validateEmail = (email: string): { isValid: boolean; error?: string } => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, error: 'Email requis' };
  }
  
  if (email.length > SECURITY_CONFIG.MAX_EMAIL_LENGTH) {
    return { isValid: false, error: 'Email trop long' };
  }
  
  // Validation RFC 5322
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Format d\'email invalide' };
  }
  
  const domain = email.split('@')[1]?.toLowerCase();
  if (SECURITY_CONFIG.BLOCKED_DOMAINS.includes(domain)) {
    return { isValid: false, error: 'Domaine email non autorisé' };
  }
  
  return { isValid: true };
};

// Validation du contenu pour détecter le spam
const validateContent = (text: string): boolean => {
  const spamRegex = new RegExp(SECURITY_CONFIG.SPAM_KEYWORDS.join('|'), 'gi');
  return !spamRegex.test(text);
};

// Rate limiting
const checkRateLimit = (clientId: string): boolean => {
  const now = Date.now();
  const record = emailAttempts.get(clientId);
  
  if (!record) {
    emailAttempts.set(clientId, { count: 1, firstAttempt: now });
    return true;
  }
  
  // Réinitialiser si la fenêtre de temps est dépassée
  if (now - record.firstAttempt > SECURITY_CONFIG.RATE_LIMIT.timeWindow) {
    emailAttempts.set(clientId, { count: 1, firstAttempt: now });
    return true;
  }
  
  // Vérifier la limite
  if (record.count >= SECURITY_CONFIG.RATE_LIMIT.maxEmails) {
    return false;
  }
  
  record.count++;
  return true;
};

// Nettoyage périodique des anciens enregistrements
const cleanupOldRecords = () => {
  const now = Date.now();
  const cutoff = now - SECURITY_CONFIG.RATE_LIMIT.timeWindow;
  
  for (const [key, record] of emailAttempts.entries()) {
    if (record.firstAttempt < cutoff) {
      emailAttempts.delete(key);
    }
  }
};

// Nettoyer toutes les heures
setInterval(cleanupOldRecords, 3600000);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message, clientId }: ContactEmailRequest = await req.json();

    // Validation des données d'entrée
    if (!name || name.length > SECURITY_CONFIG.MAX_NAME_LENGTH) {
      return new Response(
        JSON.stringify({ error: "Nom invalide ou trop long" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!subject || subject.length > SECURITY_CONFIG.MAX_SUBJECT_LENGTH) {
      return new Response(
        JSON.stringify({ error: "Sujet invalide ou trop long" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (!message || message.length > SECURITY_CONFIG.MAX_MESSAGE_LENGTH) {
      return new Response(
        JSON.stringify({ error: "Message invalide ou trop long" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Validation de l'email
    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return new Response(
        JSON.stringify({ error: emailValidation.error || "Email invalide" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Vérification du contenu pour spam
    if (!validateContent(`${subject} ${message}`)) {
      console.warn('Message potentiellement spam détecté:', { name, email });
      return new Response(
        JSON.stringify({ error: "Message détecté comme spam" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Rate limiting
    const identifier = clientId || 'unknown';
    if (!checkRateLimit(identifier)) {
      console.warn('Rate limit dépassé pour:', identifier);
      return new Response(
        JSON.stringify({ error: "Trop de tentatives. Veuillez réessayer plus tard." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Identifiant unique pour suivi de cet email
    const emailId = crypto.randomUUID();

    // Nettoyer les données d'entrée (protection XSS)
    const cleanName = name.replace(/[<>]/g, '').trim();
    const cleanSubject = subject.replace(/[<>]/g, '').trim();
    const cleanMessage = message.replace(/[<>]/g, '').trim();

    // Send email using the new dedicated contact address
    const emailResponse = await resend.emails.send({
      from: "Yamo Contact <contact@yamo.chat>",
      to: ["contactyamoo@gmail.com"],
      subject: `[Contact Yamo] ${cleanSubject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 24px;">📧 Nouveau message de contact</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Reçu via contact@yamo.chat</p>
          </div>
          
          <div style="background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px;">
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #333; margin-top: 0; padding-bottom: 10px; border-bottom: 2px solid #ddd;">Informations du contact</h2>
              <div style="display: grid; gap: 10px;">
                <p style="margin: 5px 0;"><strong>👤 Nom:</strong> ${cleanName}</p>
                <p style="margin: 5px 0;"><strong>📧 Email:</strong> <a href="mailto:${email}" style="color: #667eea;">${email}</a></p>
                <p style="margin: 5px 0;"><strong>📝 Sujet:</strong> ${cleanSubject}</p>
              </div>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <h3 style="color: #333; margin-top: 0;">💬 Message:</h3>
              <div style="background: #f8f9fa; padding: 15px; border-left: 4px solid #667eea; border-radius: 4px;">
                <p style="white-space: pre-wrap; line-height: 1.6; margin: 0;">${cleanMessage}</p>
              </div>
            </div>
            
            <div style="margin-top: 20px; padding: 15px; background: #e8f4f8; border-radius: 8px; border-left: 4px solid #17a2b8;">
              <h4 style="color: #0c5460; margin-top: 0;">🛡️ Sécurité et suivi</h4>
              <div style="font-size: 12px; color: #0c5460;">
                <p style="margin: 5px 0;">✅ Message vérifié par les filtres anti-spam</p>
                <p style="margin: 5px 0;">🔒 Envoyé via système sécurisé contact@yamo.chat</p>
                <p style="margin: 5px 0;">📊 ID de suivi: <code>${emailId}</code></p>
                <p style="margin: 5px 0;">⏰ Reçu le ${new Date().toLocaleString('fr-FR')}</p>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px; padding: 15px; background: #f1f3f4; border-radius: 8px;">
            <p style="color: #666; font-size: 12px; margin: 0;">
              <strong>Email automatique depuis Yamo (yamo.chat)</strong><br>
              Cette adresse de contact professionnelle protège votre email personnel<br>
              et maintient la sécurité de la plateforme.
            </p>
          </div>
        </div>
      `,
      reply_to: email,
      text: `
Nouveau message de contact Yamo (via contact@yamo.chat)

Nom: ${cleanName}
Email: ${email}  
Sujet: ${cleanSubject}

Message:
${cleanMessage}

---
Sécurité et suivi:
✅ Vérifié par filtres anti-spam
🔒 Envoyé via contact@yamo.chat
📊 ID: ${emailId}
⏰ ${new Date().toLocaleString('fr-FR')}
      `,
      headers: {
        "X-Email-Id": emailId,
        "X-Email-Source": "contact-form-production",
        "X-Client-Id": identifier,
        "X-Yamo-Version": "1.0.0",
        "X-Contact-Method": "dedicated-address"
      }
    });

    console.log("Contact email sent successfully via contact@yamo.chat:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      id: emailResponse.id,
      trackingId: emailId,
      contactMethod: "contact@yamo.chat"
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
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
