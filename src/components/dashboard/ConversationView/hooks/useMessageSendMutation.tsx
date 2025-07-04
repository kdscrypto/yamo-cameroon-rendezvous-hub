
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { validateRecipient, validateMessageContent } from '../RecipientValidator';
import { useAttachmentHandling } from './useAttachmentHandling';
import { Attachment } from '../types';

interface SendMessageParams {
  content: string;
  attachments?: Attachment[];
}

export const useMessageSendMutation = (
  conversationId: string, 
  conversation: any, 
  userId: string
) => {
  const queryClient = useQueryClient();
  const { saveAttachments } = useAttachmentHandling();

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, attachments }: SendMessageParams) => {
      if (!userId || !conversation) throw new Error('User or conversation not found');

      const contentValidation = validateMessageContent(content);
      if (!contentValidation.isValid) {
        throw new Error(contentValidation.error);
      }

      const participants = Array.isArray(conversation.participants) 
        ? conversation.participants as string[]
        : [];
      
      const otherParticipant = participants.find((p: string) => p !== userId);
      if (!otherParticipant) throw new Error('Other participant not found');

      const recipientValidation = await validateRecipient(otherParticipant, userId);
      if (!recipientValidation.isValid) {
        throw new Error(recipientValidation.error);
      }

      const { data: messageData, error } = await supabase
        .from('messages')
        .insert({
          sender_id: userId,
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
        await saveAttachments(messageData.id, attachments);
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

  return sendMessageMutation;
};
