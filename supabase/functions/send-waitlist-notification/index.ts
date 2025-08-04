import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  emails: string[];
  subject: string;
  template: 'event_launch' | 'general_update' | 'custom';
  customContent?: string;
  eventName?: string;
  eventDate?: string;
  eventLocation?: string;
}

const emailTemplates = {
  event_launch: (data: any) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0; font-size: 28px;">🎉 L'événement que vous attendiez est là !</h1>
      </div>
      
      <div style="background: #f9fafb; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
        <h2 style="color: #1f2937; margin-top: 0;">${data.eventName || 'Événement Spécial'}</h2>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Nous sommes ravis de vous annoncer que l'événement pour lequel vous vous êtes inscrit(e) 
          sur notre liste d'attente est maintenant disponible !
        </p>
        
        ${data.eventDate ? `<p style="color: #374151;"><strong>📅 Date :</strong> ${data.eventDate}</p>` : ''}
        ${data.eventLocation ? `<p style="color: #374151;"><strong>📍 Lieu :</strong> ${data.eventLocation}</p>` : ''}
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://lusovklxvtzhluekhwvu.supabase.co" 
           style="background: #fbbf24; color: black; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">
          Voir l'événement
        </a>
      </div>
      
      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 14px;">
        <p>Vous recevez cet email car vous vous êtes inscrit(e) à notre liste d'attente.</p>
        <p>Si vous ne souhaitez plus recevoir nos notifications, contactez-nous.</p>
      </div>
    </div>
  `,
  
  general_update: (data: any) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0; font-size: 28px;">📢 Mise à jour importante</h1>
      </div>
      
      <div style="background: #f9fafb; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Nous avons des nouvelles importantes à partager avec vous concernant nos événements à venir.
        </p>
        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Restez connecté(e) pour ne rien manquer de nos prochaines annonces !
        </p>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <a href="https://lusovklxvtzhluekhwvu.supabase.co" 
           style="background: #3b82f6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">
          Visiter le site
        </a>
      </div>
      
      <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; text-align: center; color: #6b7280; font-size: 14px;">
        <p>Vous recevez cet email car vous vous êtes inscrit(e) à notre liste d'attente.</p>
      </div>
    </div>
  `,
  
  custom: (data: any) => data.customContent || 'Contenu personnalisé non fourni.'
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify user has moderation rights
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Authorization header missing');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Invalid authentication');
    }

    // Check if user has moderation rights
    const { data: userRole } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin', 'moderator'])
      .single();

    if (!userRole) {
      throw new Error('Insufficient permissions');
    }

    const { emails, subject, template, customContent, eventName, eventDate, eventLocation }: NotificationRequest = await req.json();

    if (!emails || emails.length === 0) {
      throw new Error('No email addresses provided');
    }

    console.log(`Sending notifications to ${emails.length} recipients`);

    const templateData = {
      customContent,
      eventName,
      eventDate,
      eventLocation
    };

    const htmlContent = emailTemplates[template](templateData);

    // Send emails in batches of 50 (Resend limit)
    const batchSize = 50;
    const results = [];

    for (let i = 0; i < emails.length; i += batchSize) {
      const batch = emails.slice(i, i + batchSize);
      
      try {
        const emailResponse = await resend.emails.send({
          from: "Événements <notifications@resend.dev>",
          to: batch,
          subject: subject,
          html: htmlContent,
        });

        results.push({
          batch: Math.floor(i / batchSize) + 1,
          emails: batch,
          success: true,
          response: emailResponse
        });

        console.log(`Batch ${Math.floor(i / batchSize) + 1} sent successfully:`, emailResponse);

        // Track email sending
        for (const email of batch) {
          await supabase.from('email_tracking').insert({
            email_address: email,
            email_type: 'waitlist_notification',
            status: 'sent',
            provider: 'resend',
            metadata: {
              template,
              subject,
              batch: Math.floor(i / batchSize) + 1
            }
          });
        }

      } catch (error) {
        console.error(`Error sending batch ${Math.floor(i / batchSize) + 1}:`, error);
        results.push({
          batch: Math.floor(i / batchSize) + 1,
          emails: batch,
          success: false,
          error: error.message
        });
      }
    }

    // Mark recipients as notified in waitlist
    await supabase
      .from('event_waitlist')
      .update({ notified: true })
      .in('email', emails);

    return new Response(JSON.stringify({
      success: true,
      totalEmails: emails.length,
      batches: results.length,
      results: results
    }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error: any) {
    console.error("Error in send-waitlist-notification function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);