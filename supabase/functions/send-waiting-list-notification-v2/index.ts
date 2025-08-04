import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@4.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  email: string;
  name?: string;
}

// Template HTML de l'email basé sur le composant React
const generateEmailHTML = (userName?: string) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmation d'inscription - Yamo</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .container {
            background-color: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          }
          h1 {
            color: #2c3e50;
            margin-bottom: 20px;
            font-size: 24px;
          }
          p {
            margin-bottom: 16px;
            font-size: 16px;
          }
          .signature {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-weight: 500;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 14px;
            color: #666;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Bonjour ${userName || ''},</h1>
          
          <p>
            Bonne nouvelle ! Nous confirmons que votre inscription sur notre liste d'attente pour les événements spéciaux a bien été prise en compte, toutefois vous êtes priez de confirmer vos informations notamment : le Genre, la ville, pseudonyme Telegram.
          </p>
          
          <p>
            Vous serez parmi les premiers informés dès qu'une nouvelle opportunité se présentera.
          </p>
          
          <p>
            Merci de votre confiance.
          </p>
          
          <div class="signature">
            <p>
              Cordialement,<br />
              L'équipe Yamo
            </p>
          </div>
          
          <div class="footer">
            <p>Cet email a été envoyé automatiquement. Merci de ne pas y répondre directement.</p>
          </div>
        </div>
      </body>
    </html>
  `;
};

const handler = async (req: Request): Promise<Response> => {
  console.log('SONDE 2: Endpoint API atteint.');

  // Vérifier la clé API Resend
  if (!Deno.env.get("RESEND_API_KEY")) {
    console.error('SONDE ERREUR: La clé RESEND_API_KEY est manquante ou undefined !');
    return new Response(
      JSON.stringify({ error: "Configuration du serveur incomplète." }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
  console.log('SONDE 3: La clé RESEND_API_KEY est présente.');

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { 
        status: 405, 
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }

  try {
    // Vérifier l'authentification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization header required" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Initialiser le client Supabase pour vérification
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Vérifier le token utilisateur
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Vérifier les droits de modération
    const { data: hasRights } = await supabase.rpc('user_has_moderation_rights', { 
      _user_id: user.id 
    });

    if (!hasRights) {
      return new Response(
        JSON.stringify({ error: "Insufficient permissions" }),
        { 
          status: 403, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    const requestBody = await req.json();
    console.log('SONDE 4: Corps de la requête reçu:', requestBody);
    
    const { email, name }: NotificationRequest = requestBody;

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email is required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Envoyer l'email via Resend
    const emailResponse = await resend.emails.send({
      from: "Yamo <noreply@yamo.chat>",
      to: [email],
      subject: "Confirmation de votre inscription sur la liste d'attente Yamo",
      html: generateEmailHTML(name),
    });

    if (emailResponse.error) {
      console.error("Resend API Error:", emailResponse.error);
      return new Response(
        JSON.stringify({ error: emailResponse.error.message }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Enregistrer l'envoi dans la base de données pour le suivi
    const { error: trackingError } = await supabase
      .from('email_tracking')
      .insert({
        email_address: email,
        subject: "Confirmation de votre inscription sur la liste d'attente Yamo",
        status: 'sent',
        metadata: { 
          resend_id: emailResponse.data?.id,
          template: 'waiting_list_notification_v2',
          recipient_name: name 
        }
      });

    if (trackingError) {
      console.warn("Failed to track email:", trackingError);
    }

    console.log("Email sent successfully:", emailResponse.data);

    return new Response(
      JSON.stringify({ 
        message: "Notification sent successfully!", 
        data: emailResponse.data 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );

  } catch (error: any) {
    console.error("Error in send-waiting-list-notification-v2 function:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An internal error occurred" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
};

serve(handler);