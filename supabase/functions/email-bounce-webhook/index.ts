import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialiser le client Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface ResendWebhookEvent {
  type: string;
  created_at: string;
  data: {
    email_id: string;
    to: string[];
    from: string;
    subject: string;
    bounce?: {
      type: string;
      reason: string;
    };
    complaint?: {
      type: string;
      reason: string;
    };
  };
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const webhookEvent: ResendWebhookEvent = await req.json();
    
    console.log('Webhook reçu de Resend:', webhookEvent);

    // Déterminer le statut basé sur le type d'événement
    let status = 'sent';
    let bounceReason = null;
    let riskLevel = 'low';

    switch (webhookEvent.type) {
      case 'email.delivered':
        status = 'delivered';
        break;
      case 'email.bounced':
        status = 'bounced';
        bounceReason = webhookEvent.data.bounce?.reason || 'Bounce détecté';
        riskLevel = webhookEvent.data.bounce?.type === 'hard' ? 'high' : 'medium';
        break;
      case 'email.complained':
        status = 'bounced';
        bounceReason = `Plainte: ${webhookEvent.data.complaint?.reason || 'Plainte reçue'}`;
        riskLevel = 'high';
        break;
      case 'email.delivery_delayed':
        status = 'delayed';
        riskLevel = 'medium';
        break;
      default:
        status = 'sent';
    }

    // Enregistrer chaque destinataire
    for (const email of webhookEvent.data.to) {
      const { error } = await supabase
        .from('email_tracking')
        .insert({
          email_address: email.toLowerCase(),
          email_type: 'resend_tracked',
          status: status,
          provider: 'resend',
          bounce_reason: bounceReason,
          risk_level: riskLevel,
          metadata: {
            email_id: webhookEvent.data.email_id,
            from: webhookEvent.data.from,
            subject: webhookEvent.data.subject,
            webhook_type: webhookEvent.type,
            webhook_created_at: webhookEvent.created_at,
            bounce_details: webhookEvent.data.bounce,
            complaint_details: webhookEvent.data.complaint
          }
        });

      if (error) {
        console.error('Erreur lors de l\'enregistrement du tracking email:', error);
      }
    }

    // Si c'est un bounce, analyser les patterns
    if (status === 'bounced') {
      await analyzeEmailPatterns(webhookEvent.data.to[0]);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      processed: webhookEvent.type,
      emails_tracked: webhookEvent.data.to.length 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });

  } catch (error: any) {
    console.error("Erreur dans le webhook bounce:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

// Analyser les patterns de bounces pour une adresse
async function analyzeEmailPatterns(email: string) {
  try {
    const { data, error } = await supabase
      .rpc('analyze_email_bounces', { days_back: 30 })
      .eq('email_address', email);

    if (error) {
      console.error('Erreur analyse bounces:', error);
      return;
    }

    if (data && data.length > 0) {
      const analysis = data[0];
      console.log(`📊 Analyse bounce pour ${email}:`, {
        bounce_rate: analysis.bounce_rate,
        risk_assessment: analysis.risk_assessment,
        total_bounces: analysis.bounce_count
      });

      // Si risque élevé, on pourrait blacklister l'email ou notifier les admins
      if (analysis.risk_assessment === 'HIGH_RISK') {
        console.warn(`🚨 Email à haut risque détecté: ${email} (${analysis.bounce_rate}% de bounces)`);
        
        // Ici on pourrait envoyer une notification aux admins
        await notifyAdminsHighRiskEmail(email, analysis);
      }
    }
  } catch (error) {
    console.error('Erreur lors de l\'analyse des patterns:', error);
  }
}

// Notifier les admins d'un email à haut risque
async function notifyAdminsHighRiskEmail(email: string, analysis: any) {
  try {
    // Insérer une notification dans la table des notifications ou envoyer un email
    const { error } = await supabase
      .from('email_tracking')
      .insert({
        email_address: 'admin@yamo.chat',
        email_type: 'admin_alert',
        status: 'sent',
        provider: 'system',
        metadata: {
          alert_type: 'high_risk_email',
          problem_email: email,
          analysis: analysis,
          message: `Email ${email} marqué comme haut risque: ${analysis.bounce_rate}% de bounces`
        }
      });

    if (error) {
      console.error('Erreur notification admin:', error);
    }
  } catch (error) {
    console.error('Erreur lors de la notification admin:', error);
  }
}

serve(handler);