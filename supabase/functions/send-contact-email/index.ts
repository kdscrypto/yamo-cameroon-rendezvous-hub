
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
}

// Liste de domaines email problématiques à rejeter
const PROBLEMATIC_DOMAINS = [
  'example.com',
  'test.com',
  'localhost'
];

// Validation simple d'email côté serveur
const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return false;
  
  const domain = email.split('@')[1];
  if (PROBLEMATIC_DOMAINS.includes(domain)) return false;
  
  return true;
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message }: ContactEmailRequest = await req.json();

    // Validation de l'email
    if (!validateEmail(email)) {
      return new Response(
        JSON.stringify({ error: "Adresse email invalide ou non acceptée" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Identifiant unique pour suivi de cet email
    const emailId = crypto.randomUUID();

    // Send email to the application's email address
    const emailResponse = await resend.emails.send({
      from: "Yamo Contact <onboarding@resend.dev>",
      to: ["contactyamoo@gmail.com"],
      subject: `[Contact Yamo] ${subject}`,
      html: `
        <h2>Nouveau message de contact</h2>
        <p><strong>Nom:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Sujet:</strong> ${subject}</p>
        <hr>
        <h3>Message:</h3>
        <p style="white-space: pre-wrap;">${message}</p>
        <hr>
        <p><em>Message envoyé depuis le site Yamo</em></p>
      `,
      reply_to: email, // Allow replying directly to the sender
      // Ajouter des identifiants de suivi
      text: `ID: ${emailId}`,
      headers: {
        "X-Email-Id": emailId,
        "X-Email-Source": "contact-form"
      }
    });

    console.log("Contact email sent successfully:", emailResponse);

    // Si un webhook pour le suivi était configuré, on pourrait l'appeler ici

    return new Response(JSON.stringify({ 
      success: true, 
      id: emailResponse.id,
      trackingId: emailId
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
