
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Message } from './types';

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

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user || !conversation) throw new Error('User or conversation not found');

      // Safely handle participants as Json type
      const participants = Array.isArray(conversation.participants) 
        ? conversation.participants 
        : [];
      
      const otherParticipant = participants.find((p: string) => p !== user.id);
      if (!otherParticipant) throw new Error('Other participant not found');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: otherParticipant,
          conversation_id: conversationId,
          content: content.trim(),
          ad_id: conversation.ad_id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation-messages', conversationId] });
      toast.success('Message envoyé');
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast.error('Erreur lors de l\'envoi du message');
    }
  });

  // Mark messages as read when viewing conversation
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

  // Set up real-time subscription for new messages
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
          
          // Show notification for new messages from others
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

  const getOtherParticipant = () => {
    if (!conversation) return 'Utilisateur inconnu';
    
    // Safely handle participants as Json type
    const participants = Array.isArray(conversation.participants) 
      ? conversation.participants 
      : [];
    
    const otherParticipantId = participants.find((p: string) => p !== user?.id);
    return otherParticipantId || 'Utilisateur inconnu';
  };

  return {
    conversation,
    messages,
    isLoading,
    sendMessage: sendMessageMutation.mutate,
    isSendingMessage: sendMessageMutation.isPending,
    getOtherParticipant
  };
};
