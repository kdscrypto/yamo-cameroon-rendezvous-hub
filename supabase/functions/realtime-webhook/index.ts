import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
  type: 'db-change' | 'broadcast' | 'presence';
  event: string;
  payload: any;
  metadata?: {
    source: string;
    timestamp: string;
    userId?: string;
  };
}

interface NotificationRequest {
  userId: string;
  type: 'message' | 'ad_approved' | 'ad_rejected' | 'security_alert' | 'system';
  title: string;
  body: string;
  data?: any;
  priority?: 'low' | 'normal' | 'high' | 'critical';
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        db: {
          schema: 'public'
        }
      }
    );

    const url = new URL(req.url);
    const action = url.pathname.split('/').pop();

    switch (action) {
      case 'webhook':
        return await handleWebhook(req, supabase);
      
      case 'notify':
        return await handleNotification(req, supabase);
      
      case 'broadcast':
        return await handleBroadcast(req, supabase);
      
      case 'presence':
        return await handlePresenceUpdate(req, supabase);
      
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid endpoint' }),
          { 
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
    }

  } catch (error) {
    console.error('Error in realtime-webhook function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        details: error.message 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
};

// Traiter les webhooks entrants
async function handleWebhook(req: Request, supabase: any): Promise<Response> {
  const webhook: WebhookPayload = await req.json();
  
  console.log('Received webhook:', webhook.type, webhook.event);

  // Traiter selon le type d'événement
  switch (webhook.type) {
    case 'db-change':
      await processDbChange(webhook, supabase);
      break;
    
    case 'broadcast':
      await processBroadcast(webhook, supabase);
      break;
    
    case 'presence':
      await processPresence(webhook, supabase);
      break;
  }

  return new Response(
    JSON.stringify({ success: true, processed: webhook.type }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Traiter les changements de base de données
async function processDbChange(webhook: WebhookPayload, supabase: any) {
  const { event, payload } = webhook;
  
  // Nouveau message
  if (payload.table === 'messages' && event === 'INSERT') {
    const message = payload.record;
    
    // Créer une notification pour le destinataire
    await createNotification(supabase, {
      userId: message.recipient_id,
      type: 'message',
      title: 'Nouveau message',
      body: `Vous avez reçu un nouveau message`,
      data: { messageId: message.id, senderId: message.sender_id },
      priority: 'normal'
    });
  }
  
  // Mise à jour d'annonce
  if (payload.table === 'ads' && event === 'UPDATE') {
    const ad = payload.record;
    const oldAd = payload.old_record;
    
    // Changement de statut de modération
    if (oldAd.moderation_status !== ad.moderation_status) {
      const isApproved = ad.moderation_status === 'approved';
      
      await createNotification(supabase, {
        userId: ad.user_id,
        type: isApproved ? 'ad_approved' : 'ad_rejected',
        title: isApproved ? 'Annonce approuvée' : 'Annonce rejetée',
        body: `Votre annonce "${ad.title}" a été ${isApproved ? 'approuvée' : 'rejetée'}`,
        data: { adId: ad.id, status: ad.moderation_status },
        priority: 'normal'
      });
    }
  }
  
  // Événement de sécurité critique
  if (payload.table === 'security_events' && event === 'INSERT') {
    const securityEvent = payload.record;
    
    if (securityEvent.severity === 'critical' || securityEvent.severity === 'high') {
      // Notifier tous les administrateurs
      await notifyAdministrators(supabase, {
        type: 'security_alert',
        title: 'Alerte de sécurité',
        body: `Événement ${securityEvent.severity}: ${securityEvent.description}`,
        data: securityEvent,
        priority: 'critical'
      });
    }
  }
}

// Traiter les broadcasts
async function processBroadcast(webhook: WebhookPayload, supabase: any) {
  const { payload } = webhook;
  
  // Diffuser le message à tous les clients connectés
  console.log('Broadcasting message:', payload);
  
  // Ici, vous pourriez intégrer avec un service de push notifications
  // comme Firebase Cloud Messaging, Apple Push Notification Service, etc.
}

// Traiter les mises à jour de présence
async function processPresence(webhook: WebhookPayload, supabase: any) {
  const { payload } = webhook;
  
  // Enregistrer les statistiques de présence
  const { error } = await supabase
    .from('analytics_events')
    .insert({
      metric_type: 'user_presence',
      metric_value: 1,
      metadata: {
        event: payload.event,
        userId: payload.userId,
        status: payload.status,
        timestamp: new Date().toISOString()
      }
    });
  
  if (error) {
    console.error('Error logging presence analytics:', error);
  }
}

// Envoyer une notification directe
async function handleNotification(req: Request, supabase: any): Promise<Response> {
  const notification: NotificationRequest = await req.json();
  
  await createNotification(supabase, notification);
  
  return new Response(
    JSON.stringify({ success: true, notificationSent: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Diffuser un message
async function handleBroadcast(req: Request, supabase: any): Promise<Response> {
  const { channel, event, payload } = await req.json();
  
  // Utiliser Supabase Realtime pour diffuser
  const broadcastResult = await supabase
    .channel(channel)
    .send({
      type: 'broadcast',
      event,
      payload
    });
  
  return new Response(
    JSON.stringify({ success: true, broadcast: broadcastResult }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Mettre à jour la présence
async function handlePresenceUpdate(req: Request, supabase: any): Promise<Response> {
  const { userId, status, metadata } = await req.json();
  
  // Mettre à jour dans la base de données si nécessaire
  const { error } = await supabase
    .from('user_presence')
    .upsert({
      user_id: userId,
      status,
      last_seen: new Date().toISOString(),
      metadata: metadata || {}
    });
  
  if (error) {
    console.error('Error updating presence:', error);
  }
  
  return new Response(
    JSON.stringify({ success: true, presenceUpdated: true }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}

// Créer une notification
async function createNotification(supabase: any, notification: NotificationRequest) {
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: notification.userId,
      type: notification.type,
      title: notification.title,
      body: notification.body,
      data: notification.data || {},
      priority: notification.priority || 'normal',
      read: false
    });
  
  if (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
  
  // Envoyer via Realtime
  await supabase
    .channel(`notifications_${notification.userId}`)
    .send({
      type: 'broadcast',
      event: 'new_notification',
      payload: notification
    });
}

// Notifier tous les administrateurs
async function notifyAdministrators(supabase: any, notification: Omit<NotificationRequest, 'userId'>) {
  // Récupérer tous les administrateurs
  const { data: admins, error } = await supabase
    .from('user_roles')
    .select('user_id')
    .in('role', ['admin', 'moderator']);
  
  if (error || !admins) {
    console.error('Error fetching administrators:', error);
    return;
  }
  
  // Créer une notification pour chaque administrateur
  const promises = admins.map(admin => 
    createNotification(supabase, {
      ...notification,
      userId: admin.user_id
    })
  );
  
  await Promise.all(promises);
}

serve(handler);