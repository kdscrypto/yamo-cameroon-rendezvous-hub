
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
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
      
      return data as Message[];
    }
  });

  const { sendMessage, isSendingMessage, isRateLimited } = useMessageManagement(conversationId, conversation);

  useEffect(() => {
    if (!user || !messages) return;

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

  useEffect(() => {
    if (!conversationId) return;

    console.log('Setting up real-time subscription for conversation:', conversationId);

    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('New message in conversation:', payload);
          queryClient.invalidateQueries({ queryKey: ['conversation-messages', conversationId] });
          
          if (payload.new.sender_id !== user?.id) {
            toast.success('Nouveau message reçu');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user, queryClient]);

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
