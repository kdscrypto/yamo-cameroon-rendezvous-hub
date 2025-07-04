
import { useAuth } from '@/hooks/useAuth';
import { useMessageRateLimit } from './MessageRateLimiter';
import { useMessageSendMutation } from './hooks/useMessageSendMutation';
import { Attachment } from './types';

export const useMessageManagement = (conversationId: string, conversation: any) => {
  const { user } = useAuth();
  const { checkRateLimit, isRateLimited } = useMessageRateLimit(user?.id || '');
  
  const sendMessageMutation = useMessageSendMutation(
    conversationId, 
    conversation, 
    user?.id || ''
  );

  const sendMessage = async (content: string, attachments?: Attachment[]): Promise<void> => {
    if (!checkRateLimit()) {
      throw new Error('Rate limit exceeded');
    }

    await sendMessageMutation.mutateAsync({ content, attachments });
  };

  return {
    sendMessage,
    isSendingMessage: sendMessageMutation.isPending || isRateLimited,
    isRateLimited
  };
};
