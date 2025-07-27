// Hook pour les notifications en temps réel
import React, { useState, useEffect, useCallback } from 'react';
import { realtimeManager, NotificationData } from '@/utils/realtimeManager';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface NotificationOptions {
  showToast?: boolean;
  toastDuration?: number;
  playSound?: boolean;
  maxNotifications?: number;
}

export const useRealTimeNotifications = (options: NotificationOptions = {}) => {
  const {
    showToast = true,
    toastDuration = 5000,
    playSound = true,
    maxNotifications = 50
  } = options;

  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isInitialized, setIsInitialized] = useState(false);

  // Charger les notifications stockées au démarrage
  useEffect(() => {
    const storedNotifications = realtimeManager.getStoredNotifications();
    setNotifications(storedNotifications);
    setUnreadCount(storedNotifications.filter(n => !n.read).length);
    setIsInitialized(true);
  }, []);

  // Gérer une nouvelle notification
  const handleNewNotification = useCallback((notification: NotificationData) => {
    setNotifications(prev => {
      const updated = [notification, ...prev];
      return updated.slice(0, maxNotifications);
    });

    setUnreadCount(prev => prev + 1);

    // Afficher le toast
    if (showToast) {
      const toastOptions = {
        duration: toastDuration,
        action: notification.type === 'message' ? {
          label: 'Voir',
          onClick: () => {
            // Naviguer vers les messages
            window.location.href = '/dashboard';
          }
        } : undefined
      };

      switch (notification.type) {
        case 'message':
          toast.info(notification.title, {
            description: notification.body,
            ...toastOptions
          });
          break;
        case 'ad_approved':
          toast.success(notification.title, {
            description: notification.body,
            ...toastOptions
          });
          break;
        case 'ad_rejected':
          toast.error(notification.title, {
            description: notification.body,
            ...toastOptions
          });
          break;
        case 'security_alert':
          toast.error(notification.title, {
            description: notification.body,
            duration: 10000, // Plus long pour les alertes de sécurité
          });
          break;
        default:
          toast(notification.title, {
            description: notification.body,
            ...toastOptions
          });
      }
    }

    // Jouer un son
    if (playSound && 'Audio' in window) {
      try {
        const audio = new Audio('/notification-sound.mp3');
        audio.volume = 0.3;
        audio.play().catch(console.warn); // Ignore si le navigateur bloque l'audio
      } catch (error) {
        console.warn('Could not play notification sound:', error);
      }
    }

    // Vibration sur mobile
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
  }, [showToast, toastDuration, playSound, maxNotifications]);

  // S'abonner aux notifications quand l'utilisateur est connecté
  useEffect(() => {
    if (!user || !isInitialized) return;

    const unsubscribe = realtimeManager.onNotification(handleNewNotification);
    return unsubscribe;
  }, [user, isInitialized, handleNewNotification]);

  // Marquer une notification comme lue
  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, read: true }
          : notification
      )
    );

    setUnreadCount(prev => Math.max(0, prev - 1));

    // Mettre à jour le stockage local
    const updatedNotifications = notifications.map(notification => 
      notification.id === notificationId 
        ? { ...notification, read: true }
        : notification
    );
    localStorage.setItem('app_notifications', JSON.stringify(updatedNotifications));
  }, [notifications]);

  // Marquer toutes les notifications comme lues
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);

    // Mettre à jour le stockage local
    const updatedNotifications = notifications.map(notification => 
      ({ ...notification, read: true })
    );
    localStorage.setItem('app_notifications', JSON.stringify(updatedNotifications));
  }, [notifications]);

  // Supprimer une notification
  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => {
      const filtered = prev.filter(n => n.id !== notificationId);
      localStorage.setItem('app_notifications', JSON.stringify(filtered));
      return filtered;
    });

    // Réduire le compteur non lu si nécessaire
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, [notifications]);

  // Supprimer toutes les notifications
  const clearAll = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
    localStorage.removeItem('app_notifications');
  }, []);

  // Filtrer les notifications par type
  const getNotificationsByType = useCallback((type: NotificationData['type']) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  // Obtenir les notifications récentes (dernières 24h)
  const getRecentNotifications = useCallback(() => {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    return notifications.filter(n => n.timestamp > oneDayAgo);
  }, [notifications]);

  return {
    notifications,
    unreadCount,
    isInitialized,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    getNotificationsByType,
    getRecentNotifications
  };
};

// Hook spécialisé pour les notifications de messages
export const useMessageNotifications = () => {
  const { notifications, markAsRead } = useRealTimeNotifications({
    showToast: true,
    playSound: true
  });

  const messageNotifications = notifications.filter(n => n.type === 'message');
  const unreadMessageCount = messageNotifications.filter(n => !n.read).length;

  return {
    messageNotifications,
    unreadMessageCount,
    markMessageAsRead: markAsRead
  };
};

// Hook spécialisé pour les notifications d'administration
export const useAdminNotifications = () => {
  const { notifications, markAsRead } = useRealTimeNotifications({
    showToast: true,
    toastDuration: 10000, // Plus long pour les admins
    playSound: true
  });

  const securityNotifications = notifications.filter(n => n.type === 'security_alert');
  const systemNotifications = notifications.filter(n => n.type === 'system');
  
  return {
    securityNotifications,
    systemNotifications,
    markSecurityAsRead: markAsRead,
    unreadSecurityCount: securityNotifications.filter(n => !n.read).length,
    unreadSystemCount: systemNotifications.filter(n => !n.read).length
  };
};

export default useRealTimeNotifications;