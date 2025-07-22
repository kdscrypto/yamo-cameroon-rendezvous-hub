
/**
 * Utilitaires pour le monitoring des emails envoyés
 */

import { supabase } from '@/integrations/supabase/client';

// Types d'événements email
export type EmailEvent = 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed' | 'complained';

// Interface pour le suivi des emails
export interface EmailTrackingData {
  emailId: string;
  recipient: string;
  subject: string;
  eventType: EmailEvent;
  timestamp: Date;
  metadata?: Record<string, any>;
}

/**
 * Enregistre un événement d'email dans la base de données
 */
export const trackEmailEvent = async (data: EmailTrackingData): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('email_events')
      .insert([{
        email_id: data.emailId,
        recipient: data.recipient,
        subject: data.subject,
        event_type: data.eventType,
        metadata: data.metadata || {}
      }]);

    if (error) {
      console.error('Erreur lors du suivi email:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Exception lors du suivi email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Récupère les statistiques d'emails (taux de bounce, etc.)
 */
export const getEmailStats = async (days: number = 30): Promise<{
  sent: number;
  delivered: number;
  bounced: number;
  failed: number;
  bounceRate: number;
  deliveryRate: number;
}> => {
  // Calcule la date de début pour la période spécifiée
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  try {
    // Récupération des événements email pour la période
    const { data: events, error } = await supabase
      .from('email_events')
      .select('event_type')
      .gte('created_at', startDate.toISOString());
    
    if (error) {
      console.error('Erreur lors de la récupération des statistiques email:', error);
      return {
        sent: 0,
        delivered: 0,
        bounced: 0,
        failed: 0,
        bounceRate: 0,
        deliveryRate: 0
      };
    }

    // Comptage des différents types d'événements
    const sent = events.filter(e => e.event_type === 'sent').length;
    const delivered = events.filter(e => e.event_type === 'delivered').length;
    const bounced = events.filter(e => e.event_type === 'bounced').length;
    const failed = events.filter(e => e.event_type === 'failed').length;

    // Calcul des taux
    const bounceRate = sent > 0 ? (bounced / sent) * 100 : 0;
    const deliveryRate = sent > 0 ? (delivered / sent) * 100 : 0;

    return {
      sent,
      delivered,
      bounced,
      failed,
      bounceRate,
      deliveryRate
    };
  } catch (error) {
    console.error('Exception lors de la récupération des statistiques email:', error);
    return {
      sent: 0,
      delivered: 0,
      bounced: 0,
      failed: 0,
      bounceRate: 0,
      deliveryRate: 0
    };
  }
};
