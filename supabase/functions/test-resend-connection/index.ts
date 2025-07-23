
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Testing Resend connection with custom domain...");
    
    // Vérifier si la clé API existe
    const apiKey = Deno.env.get("RESEND_API_KEY");
    if (!apiKey) {
      console.error("RESEND_API_KEY not found in environment");
      return new Response(
        JSON.stringify({ 
          error: "RESEND_API_KEY non configurée",
          status: "failed",
          details: "La clé API Resend n'est pas définie dans les variables d'environnement"
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`API Key found, length: ${apiKey.length}`);
    
    const resend = new Resend(apiKey);

    // Test avec le domaine personnalisé
    const testEmailResponse = await resend.emails.send({
      from: "Test Yamo <noreply@send.yamo.chat>",
      to: ["contactyamoo@gmail.com"],
      subject: "Test de connexion Resend - Domaine personnalisé",
      html: `
        <h2>✅ Test de connexion Resend avec domaine personnalisé réussi !</h2>
        <p>Cet email confirme que:</p>
        <ul>
          <li>✅ La clé API Resend est correctement configurée</li>
          <li>✅ Le domaine personnalisé send.yamo.chat est fonctionnel</li>
          <li>✅ Les enregistrements DNS sont correctement configurés</li>
          <li>✅ L'intégration est opérationnelle</li>
        </ul>
        <p><strong>Domaine utilisé:</strong> send.yamo.chat</p>
        <p><em>Email de test envoyé le ${new Date().toLocaleString('fr-FR')}</em></p>
      `,
    });

    console.log("Test email sent successfully with custom domain:", testEmailResponse);

    return new Response(JSON.stringify({ 
      success: true,
      status: "connected",
      resendResponse: testEmailResponse,
      details: {
        emailId: testEmailResponse.id,
        customDomain: "send.yamo.chat",
        timestamp: new Date().toISOString(),
        message: "Connexion Resend testée avec succès sur domaine personnalisé"
      }
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Error testing Resend connection:", error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        status: "failed",
        details: {
          errorType: error.constructor.name,
          timestamp: new Date().toISOString(),
          suggestion: error.message.includes('domain') ? 
            "Vérifiez la configuration DNS de votre domaine send.yamo.chat" : 
            error.message.includes('API') ? 
            "Vérifiez votre clé API Resend" : 
            "Problème de connexion ou de configuration"
        }
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
