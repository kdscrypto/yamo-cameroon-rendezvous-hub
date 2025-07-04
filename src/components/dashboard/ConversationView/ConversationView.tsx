
import { useAuth } from '@/hooks/useAuth';
import ConversationHeader from './ConversationHeader';
import MessagesList from './MessagesList';
import MessageInput from './MessageInput';
import ConversationViewLoading from './ConversationViewLoading';
import ConversationPagination from './ConversationPagination';
import ConversationActions from './ConversationActions';
import { useConversationData } from './useConversationData';
import { ConversationViewProps } from './types';
import { useState, useEffect } from 'react';
import { Message } from './types';

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
  useEffect(() => {
    if (messages && messages.length > 0) {
      console.log('Messages received:', messages.length);
      setAllMessages(messages);
    }
  }, [messages]);

  const handleLoadMore = (newMessages: Message[], direction: 'up' | 'down') => {
    setAllMessages(prev => {
      const existingIds = new Set(prev.map(msg => msg.id));
      const uniqueNewMessages = newMessages.filter(msg => !existingIds.has(msg.id));
      
      if (direction === 'up') {
        return [...uniqueNewMessages, ...prev];
      } else {
        return [...prev, ...uniqueNewMessages];
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
