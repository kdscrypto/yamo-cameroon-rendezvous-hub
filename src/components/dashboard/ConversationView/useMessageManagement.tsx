
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { validateRecipient, validateMessageContent } from './RecipientValidator';
import { useMessageRateLimit } from './MessageRateLimiter';

interface Attachment {
  url: string;
  name: string;
  type: string;
  size: number;
}

export const useMessageManagement = (conversationId: string, conversation: any) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { checkRateLimit, isRateLimited } = useMessageRateLimit(user?.id || '');

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, attachments }: { content: string; attachments?: Attachment[] }) => {
      if (!user || !conversation) throw new Error('User or conversation not found');

      if (!checkRateLimit()) {
        throw new Error('Rate limit exceeded');
      }

      const contentValidation = validateMessageContent(content);
      if (!contentValidation.isValid) {
        throw new Error(contentValidation.error);
      }

      const participants = Array.isArray(conversation.participants) 
        ? conversation.participants as string[]
        : [];
      
      const otherParticipant = participants.find((p: string) => p !== user.id);
      if (!otherParticipant) throw new Error('Other participant not found');

      const recipientValidation = await validateRecipient(otherParticipant, user.id);
      if (!recipientValidation.isValid) {
        throw new Error(recipientValidation.error);
      }

      const { data: messageData, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: otherParticipant,
          conversation_id: conversationId,
          content: content.trim(),
          ad_id: conversation.ad_id || null
        })
        .select()
        .single();

      if (error) throw error;

      // Handle attachments if provided
      if (attachments && attachments.length > 0) {
        const attachmentInserts = attachments.map(attachment => ({
          message_id: messageData.id,
          file_name: attachment.name,
          file_url: attachment.url,
          file_type: attachment.type,
          file_size: attachment.size
        }));

        const { error: attachmentError } = await supabase
          .from('message_attachments')
          .insert(attachmentInserts);

        if (attachmentError) {
          console.error('Error saving attachments:', attachmentError);
        }
      }

      return messageData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversation-messages', conversationId] });
      toast.success('Message envoyé');
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast.error(error.message || 'Erreur lors de l\'envoi du message');
    }
  });

  const sendMessage = async (content: string, attachments?: Attachment[]): Promise<void> => {
    await sendMessageMutation.mutateAsync({ content, attachments });
  };

  return {
    sendMessage,
    isSendingMessage: sendMessageMutation.isPending || isRateLimited,
    isRateLimited
  };
};
