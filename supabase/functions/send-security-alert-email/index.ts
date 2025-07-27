import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

interface EmailRequest {
  to: string;
  rule: string;
  event: {
    type: string;
    severity: string;
    description: string;
    timestamp: string;
    metadata?: any;
  };
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');

    if (!resendApiKey) {
      console.error('RESEND_API_KEY not found');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { to, rule, event }: EmailRequest = await req.json();

    // Validate input
    if (!to || !rule || !event) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Format the email content
    const subject = `🚨 Alerte de sécurité - ${event.severity.toUpperCase()}`;
    const timestamp = new Date(event.timestamp).toLocaleString('fr-FR');
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>Alerte de sécurité</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            .header { background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 24px; }
            .content { padding: 30px; }
            .alert-box { background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 6px; padding: 16px; margin: 20px 0; }
            .severity-critical { border-color: #ef4444; background-color: #fef2f2; }
            .severity-high { border-color: #f97316; background-color: #fff7ed; }
            .severity-medium { border-color: #eab308; background-color: #fefce8; }
            .severity-low { border-color: #22c55e; background-color: #f0fdf4; }
            .details { background-color: #f9fafb; padding: 16px; border-radius: 6px; margin: 20px 0; }
            .details h3 { margin-top: 0; color: #374151; }
            .footer { background-color: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
            .metadata { font-family: monospace; background-color: #f3f4f6; padding: 10px; border-radius: 4px; overflow-x: auto; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 Alerte de sécurité</h1>
              <p>Système de surveillance automatique</p>
            </div>
            
            <div class="content">
              <div class="alert-box severity-${event.severity}">
                <h2 style="margin: 0 0 10px 0; color: #1f2937;">
                  ${rule}
                </h2>
                <p style="margin: 0; font-size: 16px; color: #374151;">
                  <strong>Événement:</strong> ${event.type}<br>
                  <strong>Sévérité:</strong> ${event.severity.toUpperCase()}<br>
                  <strong>Heure:</strong> ${timestamp}
                </p>
              </div>
              
              <div class="details">
                <h3>Description</h3>
                <p>${event.description}</p>
                
                ${event.metadata ? `
                  <h3>Métadonnées</h3>
                  <div class="metadata">
                    ${JSON.stringify(event.metadata, null, 2)}
                  </div>
                ` : ''}
              </div>
              
              <div style="background-color: #eff6ff; padding: 16px; border-radius: 6px; border-left: 4px solid #3b82f6;">
                <h3 style="margin-top: 0; color: #1e40af;">Actions recommandées</h3>
                <ul style="margin: 0; color: #1e40af;">
                  <li>Vérifiez les logs de sécurité dans le tableau de bord</li>
                  <li>Analysez l'origine de l'événement</li>
                  <li>Prenez les mesures correctives nécessaires</li>
                  ${event.severity === 'critical' ? '<li><strong>⚠️ Action immédiate requise pour cet événement critique</strong></li>' : ''}
                </ul>
              </div>
            </div>
            
            <div class="footer">
              <p>
                Cet email a été envoyé automatiquement par le système de surveillance de sécurité.<br>
                Si vous recevez cet email par erreur, veuillez nous contacter.
              </p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email via Resend
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Sécurité <security@your-domain.com>',
        to: [to],
        subject: subject,
        html: htmlContent,
      }),
    });

    if (!emailResponse.ok) {
      const errorText = await emailResponse.text();
      console.error('Resend API error:', errorText);
      throw new Error(`Failed to send email: ${emailResponse.status}`);
    }

    const emailResult = await emailResponse.json();
    console.log('Email sent successfully:', emailResult);

    // Log the email event
    const { error: logError } = await supabase
      .from('email_events')
      .insert({
        email_id: emailResult.id || 'unknown',
        recipient: to,
        subject: subject,
        event_type: 'security_alert',
        metadata: {
          rule,
          event,
          resend_response: emailResult
        }
      });

    if (logError) {
      console.error('Error logging email event:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        email_id: emailResult.id,
        message: 'Security alert email sent successfully'
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in send-security-alert-email function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});