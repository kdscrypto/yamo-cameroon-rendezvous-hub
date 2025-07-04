
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useConversationQueries = (conversationId: string) => {
  const { user } = useAuth();

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
      return data;
    },
    refetchInterval: false,
    staleTime: 0,
  });

  return {
    conversation,
    otherParticipantProfile,
    messages,
    isLoading
  };
};
