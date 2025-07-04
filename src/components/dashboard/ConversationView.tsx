
import { useAuth } from '@/hooks/useAuth';
import ConversationHeader from './ConversationView/ConversationHeader';
import MessagesList from './ConversationView/MessagesList';
import MessageInput from './ConversationView/MessageInput';
import ConversationViewLoading from './ConversationView/ConversationViewLoading';
import { useConversationData } from './ConversationView/useConversationData';
import { ConversationViewProps } from './ConversationView/types';

const ConversationView = ({ conversationId, onBack }: ConversationViewProps) => {
  const { user } = useAuth();
  const {
    conversation,
    messages,
    isLoading,
    sendMessage,
    isSendingMessage,
    getOtherParticipant
  } = useConversationData(conversationId);

  if (isLoading) {
    return <ConversationViewLoading onBack={onBack} />;
  }

  return (
    <div className="space-y-4">
      <ConversationHeader
        onBack={onBack}
        adTitle={conversation?.ads?.title}
        otherParticipant={getOtherParticipant()}
      />

      <div className="flex flex-col">
        <MessagesList messages={messages} currentUserId={user?.id} />
        <MessageInput onSendMessage={sendMessage} isLoading={isSendingMessage} />
      </div>
    </div>
  );
};

export default ConversationView;
