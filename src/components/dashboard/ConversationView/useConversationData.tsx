
import { useAuth } from '@/hooks/useAuth';
import { useMessageManagement } from './useMessageManagement';
import { useConversationQueries } from './hooks/useConversationQueries';
import { useConversationRealtime } from './hooks/useConversationRealtime';
import { useMessageReadStatus } from './hooks/useMessageReadStatus';
import { getOtherParticipantFromConversation, getOtherParticipantId } from './utils/participantUtils';

export const useConversationData = (conversationId: string) => {
  const { user } = useAuth();

  const {
    conversation,
    otherParticipantProfile,
    messages,
    isLoading
  } = useConversationQueries(conversationId);

  const { sendMessage, isSendingMessage, isRateLimited } = useMessageManagement(conversationId, conversation);

  useConversationRealtime(conversationId);
  useMessageReadStatus(messages);

  const getOtherParticipant = (): string => {
    return getOtherParticipantFromConversation(conversation, user?.id, otherParticipantProfile);
  };

  const getOtherParticipantIdValue = (): string | undefined => {
    return getOtherParticipantId(conversation, user?.id);
  };

  return {
    conversation,
    messages,
    isLoading,
    sendMessage,
    isSendingMessage,
    getOtherParticipant,
    getOtherParticipantId: getOtherParticipantIdValue,
    otherParticipantProfile,
    isRateLimited
  };
};
