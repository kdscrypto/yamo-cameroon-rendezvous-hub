
import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Message } from '../types';

export const useConversationRealtime = (conversationId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Optimized function to add new message to cache
  const addMessageToCache = useCallback((newMessage: Message) => {
    queryClient.setQueryData(['conversation-messages', conversationId], (oldData: Message[] | undefined) => {
      if (!oldData) return [newMessage];
      
      // Check if message already exists to prevent duplicates
      const messageExists = oldData.some(msg => msg.id === newMessage.id);
      if (messageExists) return oldData;
      
      // Insert message in chronological order
      const updatedMessages = [...oldData, newMessage].sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
      
      return updatedMessages;
    });
  }, [queryClient, conversationId]);

  // Enhanced real-time configuration
  useEffect(() => {
    if (!conversationId || !user) return;

    console.log('Setting up enhanced real-time subscription for conversation:', conversationId);

    const messagesChannel = supabase
      .channel(`conversation-${conversationId}-messages`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          console.log('New message received via real-time:', payload);
          
          try {
            // Fetch the complete message with attachments
            const { data: completeMessage, error } = await supabase
              .from('messages')
              .select(`
                *,
                message_attachments(*)
              `)
              .eq('id', payload.new.id)
              .single();

            if (error) {
              console.error('Error fetching complete message:', error);
              return;
            }

            if (completeMessage) {
              addMessageToCache(completeMessage as Message);
              
              // Show notification only for messages from other users
              if (completeMessage.sender_id !== user.id) {
                toast.success('Nouveau message reçu');
              }
            }
          } catch (error) {
            console.error('Error processing new message:', error);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          console.log('Message updated via real-time:', payload);
          
          try {
            // Fetch the complete updated message
            const { data: updatedMessage, error } = await supabase
              .from('messages')
              .select(`
                *,
                message_attachments(*)
              `)
              .eq('id', payload.new.id)
              .single();

            if (error) {
              console.error('Error fetching updated message:', error);
              return;
            }

            if (updatedMessage) {
              queryClient.setQueryData(['conversation-messages', conversationId], (oldData: Message[] | undefined) => {
                if (!oldData) return [updatedMessage as Message];
                
                return oldData.map(msg => 
                  msg.id === updatedMessage.id ? { ...msg, ...updatedMessage } : msg
                );
              });
            }
          } catch (error) {
            console.error('Error processing updated message:', error);
          }
        }
      )
      .subscribe((status) => {
        console.log('Real-time subscription status:', status);
      });

    return () => {
      console.log('Cleaning up real-time subscription');
      supabase.removeChannel(messagesChannel);
    };
  }, [conversationId, user, addMessageToCache, queryClient]);

  return { addMessageToCache };
};
