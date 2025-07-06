
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';
import { toast } from 'sonner';

interface Conversation {
  id: string;
  participants: string[];
  ad_id?: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  ads?: {
    title: string;
  };
  unread_count?: number;
  last_message?: {
    content: string;
    sender_id: string;
  };
}

export const useConversationsData = () => {
  const { user } = useAuth();

  const { data: conversations, isLoading, refetch } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('Fetching conversations for user:', user.id);
      
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          ads(title)
        `)
        .order('last_message_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching conversations:', error);
        return [];
      }
      
      // Fetch unread message counts and last messages for each conversation
      const conversationsWithDetails = await Promise.all(
        data.map(async (conversation) => {
          // Get unread count
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conversation.id)
            .eq('recipient_id', user.id)
            .eq('is_read', false);

          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, sender_id')
            .eq('conversation_id', conversation.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...conversation,
            unread_count: unreadCount || 0,
            last_message: lastMessage
          };
        })
      );
      
      console.log('Fetched conversations with details:', conversationsWithDetails);
      return conversationsWithDetails as Conversation[];
    },
    enabled: !!user
  });

  // Set up real-time subscription for conversations
  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time subscription for conversations');

    const channel = supabase
      .channel('conversations-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          console.log('Conversation updated:', payload);
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('Message updated:', payload);
          refetch();
          
          // Show notification for new messages
          if (payload.eventType === 'INSERT' && payload.new.recipient_id === user.id) {
            toast.success('Nouveau message reçu');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refetch]);

  return {
    conversations,
    isLoading,
    refetch
  };
};
