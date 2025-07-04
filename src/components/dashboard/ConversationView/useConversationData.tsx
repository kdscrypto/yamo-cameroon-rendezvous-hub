
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Message } from './types';
import { useMessageManagement } from './useMessageManagement';

export const useConversationData = (conversationId: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: conversation } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          ads(title, id)
        `)
        .eq('id', conversationId)
        .single();
      
      if (error) {
        console.error('Error fetching conversation:', error);
        return null;
      }
      
      return data;
    }
  });

  const { data: otherParticipantProfile } = useQuery({
    queryKey: ['other-participant-profile', conversationId, conversation],
    queryFn: async () => {
      if (!conversation || !user) return null;
      
      const participants = Array.isArray(conversation.participants) 
        ? conversation.participants as string[]
        : [];
      
      const otherParticipantId = participants.find((p: string) => p !== user.id);
      if (!otherParticipantId) return null;

      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', otherParticipantId)
        .single();
      
      if (error) {
        console.error('Error fetching other participant profile:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!conversation && !!user
  });

  const { data: messages, isLoading } = useQuery({
    queryKey: ['conversation-messages', conversationId],
    queryFn: async () => {
      console.log('Fetching messages for conversation:', conversationId);
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          message_attachments(*)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }
      
      console.log('Fetched messages:', data?.length || 0);
      return data as Message[];
    },
    refetchInterval: false,
    staleTime: 0,
  });

  const { sendMessage, isSendingMessage, isRateLimited } = useMessageManagement(conversationId, conversation);

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

  const getOtherParticipant = (): string => {
    if (otherParticipantProfile?.full_name) {
      return otherParticipantProfile.full_name;
    }
    
    if (otherParticipantProfile?.email) {
      return otherParticipantProfile.email;
    }
    
    if (!conversation) return 'Utilisateur inconnu';
    
    const participants = Array.isArray(conversation.participants) 
      ? conversation.participants as string[]
      : [];
    
    const otherParticipantId = participants.find((p: string) => p !== user?.id);
    return otherParticipantId || 'Utilisateur inconnu';
  };

  const getOtherParticipantId = (): string | undefined => {
    if (!conversation || !user) return undefined;
    
    const participants = Array.isArray(conversation.participants) 
      ? conversation.participants as string[]
      : [];
    
    return participants.find((p: string) => p !== user.id);
  };

  return {
    conversation,
    messages,
    isLoading,
    sendMessage,
    isSendingMessage,
    getOtherParticipant,
    getOtherParticipantId,
    otherParticipantProfile,
    isRateLimited
  };
};
