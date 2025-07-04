
import { useAuth } from '@/hooks/useAuth';
import ConversationHeader from './ConversationView/ConversationHeader';
import MessagesList from './ConversationView/MessagesList';
import MessageInput from './ConversationView/MessageInput';
import ConversationViewLoading from './ConversationView/ConversationViewLoading';
import ConversationPagination from './ConversationView/ConversationPagination';
import ConversationActions from './ConversationView/ConversationActions';
import { useConversationData } from './ConversationView/useConversationData';
import { ConversationViewProps } from './ConversationView/types';
import { useState } from 'react';
import { Message } from './ConversationView/types';

const ConversationView = ({ conversationId, onBack }: ConversationViewProps) => {
  const { user } = useAuth();
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const {
    conversation,
    messages,
    isLoading,
    sendMessage,
    isSendingMessage,
    getOtherParticipant,
    getOtherParticipantId,
    isRateLimited
  } = useConversationData(conversationId);

  // Update allMessages when messages change
  useState(() => {
    if (messages) {
      setAllMessages(messages);
    }
  }, [messages]);

  const handleLoadMore = (newMessages: Message[], direction: 'up' | 'down') => {
    setAllMessages(prev => {
      if (direction === 'up') {
        return [...newMessages, ...prev];
      } else {
        return [...prev, ...newMessages];
      }
    });
  };

  const handleConversationAction = (action: string) => {
    switch (action) {
      case 'delete':
        onBack();
        break;
      case 'archive':
        // Handle archive
        break;
      case 'mute':
        // Handle mute
        break;
      case 'report':
        // Handle report
        break;
    }
  };

  if (isLoading) {
    return <ConversationViewLoading onBack={onBack} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <ConversationHeader
          onBack={onBack}
          adTitle={conversation?.ads?.title}
          otherParticipant={getOtherParticipant()}
          otherParticipantId={getOtherParticipantId()}
        />
        <ConversationActions
          conversationId={conversationId}
          onDelete={() => handleConversationAction('delete')}
          onArchive={() => handleConversationAction('archive')}
          onMute={() => handleConversationAction('mute')}
          onReport={() => handleConversationAction('report')}
        />
      </div>

      <div className="flex flex-col">
        <ConversationPagination
          conversationId={conversationId}
          messages={allMessages}
          onLoadMore={handleLoadMore}
          currentUserId={user?.id}
        />
        
        <MessagesList 
          conversationId={conversationId}
          messages={allMessages} 
          currentUserId={user?.id} 
        />
        
        <MessageInput 
          conversationId={conversationId}
          onSendMessage={sendMessage} 
          isLoading={isSendingMessage}
          isRateLimited={isRateLimited}
        />
      </div>
    </div>
  );
};

export default ConversationView;
