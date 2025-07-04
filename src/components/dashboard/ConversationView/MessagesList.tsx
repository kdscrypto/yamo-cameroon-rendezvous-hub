
import { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import WhatsAppMessageBubble from './WhatsAppMessageBubble';
import { TypingIndicator } from '../TypingIndicator';
import { Message } from './types';
import { isSameDay } from 'date-fns';

interface MessagesListProps {
  conversationId: string;
  messages?: Message[];
  currentUserId?: string;
}

const MessagesList = ({ conversationId, messages, currentUserId }: MessagesListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Enhanced auto-scroll logic
  useEffect(() => {
    if (!messagesContainerRef.current || !messages) return;

    const container = messagesContainerRef.current;
    const isScrolledToBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 100;
    
    // Always scroll to bottom for new messages if user is near the bottom
    if (isScrolledToBottom) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: 'smooth',
          block: 'end'
        });
      }, 100);
    }
  }, [messages]);

  const shouldShowDateHeader = (currentMessage: Message, previousMessage?: Message) => {
    if (!previousMessage) return true;
    
    const currentDate = new Date(currentMessage.created_at);
    const previousDate = new Date(previousMessage.created_at);
    
    return !isSameDay(currentDate, previousDate);
  };

  return (
    <Card className="min-h-[500px] flex flex-col bg-gray-50 dark:bg-gray-900">
      <CardContent 
        ref={messagesContainerRef}
        className="flex-1 p-4 overflow-y-auto max-h-[500px]" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f3f4f6' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-11.046-8.954-20-20-20v20h20z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      >
        <div className="space-y-1">
          {messages?.map((message, index) => {
            const isOwn = message.sender_id === currentUserId;
            const previousMessage = index > 0 ? messages[index - 1] : undefined;
            const showDateHeader = shouldShowDateHeader(message, previousMessage);
            
            return (
              <WhatsAppMessageBubble
                key={`${message.id}-${message.created_at}`}
                message={message}
                isOwn={isOwn}
                showDateHeader={showDateHeader}
              />
            );
          })}
          <TypingIndicator conversationId={conversationId} />
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
    </Card>
  );
};

export default MessagesList;
