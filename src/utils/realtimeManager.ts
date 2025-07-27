// Gestionnaire centralisé du temps réel pour l'application
import { supabase } from '@/integrations/supabase/client';
import { securityMonitor } from './productionMonitoring';

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';
type RealtimeCallback = (payload: any) => void;

interface RealtimeSubscription {
  id: string;
  table: string;
  event: RealtimeEvent;
  callback: RealtimeCallback;
  channel: any;
}

interface NotificationData {
  id: string;
  type: 'message' | 'ad_approved' | 'ad_rejected' | 'security_alert' | 'system';
  title: string;
  body: string;
  userId?: string;
  data?: any;
  timestamp: number;
  read: boolean;
}

interface UserPresence {
  userId: string;
  username?: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: string;
  currentPage?: string;
}

class RealtimeManager {
  private static instance: RealtimeManager;
  private subscriptions = new Map<string, RealtimeSubscription>();
  private presenceChannel: any = null;
  private notificationCallbacks = new Set<(notification: NotificationData) => void>();
  private presenceCallbacks = new Set<(users: UserPresence[]) => void>();
  private currentUser: UserPresence | null = null;

  static getInstance(): RealtimeManager {
    if (!RealtimeManager.instance) {
      RealtimeManager.instance = new RealtimeManager();
    }
    return RealtimeManager.instance;
  }

  // Initialiser le système temps réel
  async initialize(userId?: string, username?: string) {
    if (userId) {
      this.currentUser = {
        userId,
        username,
        status: 'online',
        lastSeen: new Date().toISOString(),
        currentPage: window.location.pathname
      };

      // Initialiser la présence
      await this.initializePresence();
      
      // Écouter les notifications
      this.subscribeToNotifications(userId);
      
      // Écouter les mises à jour de sécurité
      this.subscribeToSecurityEvents();
    }

    // Démarrer le monitoring des performances temps réel
    this.startPerformanceMonitoring();

    securityMonitor.logPerformanceMetric({
      action: 'realtime_initialized',
      duration: 0,
      timestamp: Date.now(),
      success: true
    });
  }

  // Système de présence utilisateur
  private async initializePresence() {
    if (!this.currentUser) return;

    this.presenceChannel = supabase.channel('user_presence');

    this.presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const presenceState = this.presenceChannel.presenceState();
        const users = this.extractUsersFromPresence(presenceState);
        this.notifyPresenceCallbacks(users);
      })
      .on('presence', { event: 'join' }, ({ newPresences }: any) => {
        console.log('User joined:', newPresences);
        securityMonitor.logPerformanceMetric({
          action: 'user_joined',
          duration: newPresences.length,
          timestamp: Date.now(),
          success: true
        });
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }: any) => {
        console.log('User left:', leftPresences);
        securityMonitor.logPerformanceMetric({
          action: 'user_left',
          duration: leftPresences.length,
          timestamp: Date.now(),
          success: true
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED' && this.currentUser) {
          const trackingResult = await this.presenceChannel.track(this.currentUser);
          console.log('Presence tracking result:', trackingResult);
        }
      });
  }

  // Extraire les utilisateurs de l'état de présence
  private extractUsersFromPresence(presenceState: any): UserPresence[] {
    const users: UserPresence[] = [];
    
    Object.keys(presenceState).forEach(key => {
      const presences = presenceState[key];
      presences.forEach((presence: any) => {
        users.push({
          userId: presence.userId,
          username: presence.username,
          status: presence.status,
          lastSeen: presence.lastSeen,
          currentPage: presence.currentPage
        });
      });
    });

    return users;
  }

  // Mettre à jour le statut de présence
  async updatePresence(updates: Partial<UserPresence>) {
    if (!this.presenceChannel || !this.currentUser) return;

    this.currentUser = { ...this.currentUser, ...updates };
    await this.presenceChannel.track(this.currentUser);
  }

  // Écouter les notifications en temps réel
  private subscribeToNotifications(userId: string) {
    // Écouter les nouveaux messages
    this.subscribe('messages', 'INSERT', (payload) => {
      if (payload.new.recipient_id === userId) {
        this.sendNotification({
          id: `message_${payload.new.id}`,
          type: 'message',
          title: 'Nouveau message',
          body: 'Vous avez reçu un nouveau message',
          userId,
          data: payload.new,
          timestamp: Date.now(),
          read: false
        });
      }
    });

    // Écouter les mises à jour d'annonces
    this.subscribe('ads', 'UPDATE', (payload) => {
      if (payload.new.user_id === userId && payload.old.moderation_status !== payload.new.moderation_status) {
        const isApproved = payload.new.moderation_status === 'approved';
        this.sendNotification({
          id: `ad_${payload.new.id}`,
          type: isApproved ? 'ad_approved' : 'ad_rejected',
          title: isApproved ? 'Annonce approuvée' : 'Annonce rejetée',
          body: `Votre annonce "${payload.new.title}" a été ${isApproved ? 'approuvée' : 'rejetée'}`,
          userId,
          data: payload.new,
          timestamp: Date.now(),
          read: false
        });
      }
    });
  }

  // Écouter les événements de sécurité
  private subscribeToSecurityEvents() {
    this.subscribe('security_events', 'INSERT', (payload) => {
      if (payload.new.severity === 'critical' || payload.new.severity === 'high') {
        this.sendNotification({
          id: `security_${payload.new.id}`,
          type: 'security_alert',
          title: 'Alerte de sécurité',
          body: `Événement ${payload.new.severity}: ${payload.new.description}`,
          data: payload.new,
          timestamp: Date.now(),
          read: false
        });
      }
    });
  }

  // Monitoring des performances en temps réel
  private startPerformanceMonitoring() {
    setInterval(() => {
      const activeSubscriptions = this.subscriptions.size;
      const hasPresenceChannel = !!this.presenceChannel;
      
      securityMonitor.logPerformanceMetric({
        action: 'realtime_health_check',
        duration: activeSubscriptions,
        timestamp: Date.now(),
        success: hasPresenceChannel
      });
    }, 30000); // Toutes les 30 secondes
  }

  // S'abonner à une table pour des événements temps réel
  subscribe(table: string, event: RealtimeEvent, callback: RealtimeCallback): string {
    const id = `${table}_${event}_${Date.now()}`;
    
    const channel = supabase
      .channel(`${table}_changes_${id}`)
      .on('postgres_changes', {
        event,
        schema: 'public',
        table
      }, callback)
      .subscribe();

    const subscription: RealtimeSubscription = {
      id,
      table,
      event,
      callback,
      channel
    };

    this.subscriptions.set(id, subscription);
    
    securityMonitor.logPerformanceMetric({
      action: 'realtime_subscription_created',
      duration: 0,
      timestamp: Date.now(),
      success: true
    });

    return id;
  }

  // Se désabonner d'un événement
  unsubscribe(subscriptionId: string) {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      supabase.removeChannel(subscription.channel);
      this.subscriptions.delete(subscriptionId);
      
      securityMonitor.logPerformanceMetric({
        action: 'realtime_subscription_removed',
        duration: 0,
        timestamp: Date.now(),
        success: true
      });
    }
  }

  // Envoyer une notification
  private sendNotification(notification: NotificationData) {
    this.notificationCallbacks.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in notification callback:', error);
      }
    });

    // Enregistrer la notification si c'est un utilisateur connecté
    if (notification.userId && this.currentUser?.userId === notification.userId) {
      this.storeNotification(notification);
    }
  }

  // Stocker la notification localement
  private storeNotification(notification: NotificationData) {
    try {
      const stored = localStorage.getItem('app_notifications') || '[]';
      const notifications = JSON.parse(stored);
      notifications.unshift(notification);
      
      // Garder seulement les 50 dernières notifications
      const trimmed = notifications.slice(0, 50);
      localStorage.setItem('app_notifications', JSON.stringify(trimmed));
    } catch (error) {
      console.error('Error storing notification:', error);
    }
  }

  // Récupérer les notifications stockées
  getStoredNotifications(): NotificationData[] {
    try {
      const stored = localStorage.getItem('app_notifications') || '[]';
      return JSON.parse(stored);
    } catch (error) {
      console.error('Error getting stored notifications:', error);
      return [];
    }
  }

  // S'abonner aux notifications
  onNotification(callback: (notification: NotificationData) => void) {
    this.notificationCallbacks.add(callback);
    return () => this.notificationCallbacks.delete(callback);
  }

  // S'abonner aux changements de présence
  onPresenceChange(callback: (users: UserPresence[]) => void) {
    this.presenceCallbacks.add(callback);
    return () => this.presenceCallbacks.delete(callback);
  }

  // Notifier les callbacks de présence
  private notifyPresenceCallbacks(users: UserPresence[]) {
    this.presenceCallbacks.forEach(callback => {
      try {
        callback(users);
      } catch (error) {
        console.error('Error in presence callback:', error);
      }
    });
  }

  // Nettoyer toutes les souscriptions
  cleanup() {
    this.subscriptions.forEach(subscription => {
      supabase.removeChannel(subscription.channel);
    });
    this.subscriptions.clear();

    if (this.presenceChannel) {
      supabase.removeChannel(this.presenceChannel);
      this.presenceChannel = null;
    }

    this.notificationCallbacks.clear();
    this.presenceCallbacks.clear();
    this.currentUser = null;

    securityMonitor.logPerformanceMetric({
      action: 'realtime_cleanup',
      duration: 0,
      timestamp: Date.now(),
      success: true
    });
  }

  // Obtenir les statistiques temps réel
  getStats() {
    return {
      activeSubscriptions: this.subscriptions.size,
      hasPresenceChannel: !!this.presenceChannel,
      currentUser: this.currentUser,
      notificationCallbacks: this.notificationCallbacks.size,
      presenceCallbacks: this.presenceCallbacks.size
    };
  }
}

// Instance globale
export const realtimeManager = RealtimeManager.getInstance();

export type { NotificationData, UserPresence, RealtimeEvent };
export default realtimeManager;