
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Message } from '../types';

export const useMessageReadStatus = (messages: Message[] | undefined) => {
  const { user } = useAuth();

  // Mark messages as read
  useEffect(() => {
    if (!user || !messages || messages.length === 0) return;

    const unreadMessages = messages.filter(
      msg => msg.recipient_id === user.id && !msg.is_read
    );

    if (unreadMessages.length > 0) {
      const markAsRead = async () => {
        const { error } = await supabase
          .from('messages')
          .update({ is_read: true })
          .in('id', unreadMessages.map(msg => msg.id));
        
        if (error) {
          console.error('Error marking messages as read:', error);
        }
      };

      markAsRead();
    }
  }, [messages, user]);
};
