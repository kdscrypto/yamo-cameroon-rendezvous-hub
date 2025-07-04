
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: 'message' | 'system' | 'mention';
  title: string;
  content: string;
  created_at: string;
  is_read: boolean;
  data?: any;
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Check if browser supports notifications
  useEffect(() => {
    if ('Notification' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  // Request notification permission
  const requestPermission = async () => {
    if (!isSupported) return false;
    
    const result = await Notification.requestPermission();
    setPermission(result);
    return result === 'granted';
  };

  // Show browser notification
  const showBrowserNotification = (title: string, options?: NotificationOptions) => {
    if (!isSupported || permission !== 'granted') return;
    
    const notification = new Notification(title, {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      ...options
    });

    // Auto close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    return notification;
  };

  // Listen for real-time notifications
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel(`notifications_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('New message notification:', payload);
          
          // Get sender information
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', payload.new.sender_id)
            .single();

          const senderName = senderProfile?.full_name || senderProfile?.email || 'Utilisateur inconnu';
          const content = payload.new.content;
          
          // Show toast notification
          toast.success(`Nouveau message de ${senderName}`, {
            description: content.length > 50 ? content.substring(0, 50) + '...' : content,
            action: {
              label: 'Voir',
              onClick: () => {
                // Navigate to conversation (would need routing context)
                console.log('Navigate to conversation:', payload.new.conversation_id);
              }
            }
          });

          // Show browser notification
          showBrowserNotification(`Nouveau message de ${senderName}`, {
            body: content.length > 100 ? content.substring(0, 100) + '...' : content,
            tag: `message_${payload.new.id}`,
            data: {
              conversationId: payload.new.conversation_id,
              messageId: payload.new.id
            }
          });

          // Update unread count
          setUnreadCount(prev => prev + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, permission, isSupported]);

  // Get unread count on mount
  useEffect(() => {
    if (!user) return;

    const getUnreadCount = async () => {
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('is_read', false);

      setUnreadCount(count || 0);
    };

    getUnreadCount();
  }, [user]);

  // Mark notifications as read
  const markAsRead = async (messageIds: string[]) => {
    if (!user || messageIds.length === 0) return;

    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .in('id', messageIds)
      .eq('recipient_id', user.id);

    if (!error) {
      setUnreadCount(prev => Math.max(0, prev - messageIds.length));
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('recipient_id', user.id)
      .eq('is_read', false);

    if (!error) {
      setUnreadCount(0);
    }
  };

  return {
    notifications,
    unreadCount,
    isSupported,
    permission,
    requestPermission,
    showBrowserNotification,
    markAsRead,
    markAllAsRead
  };
};
