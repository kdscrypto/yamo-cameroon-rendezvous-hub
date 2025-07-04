
import { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import MessageBubble from './MessageBubble';
import { Message } from './types';

interface MessagesListProps {
  messages?: Message[];
  currentUserId?: string;
}

const MessagesList = ({ messages, currentUserId }: MessagesListProps) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Card className="min-h-[500px] flex flex-col">
      <CardContent className="flex-1 p-4 overflow-y-auto max-h-[500px]">
        <div className="space-y-4">
          {messages?.map((message) => {
            const isOwn = message.sender_id === currentUserId;
            
            return (
              <MessageBubble
                key={message.id}
                message={message}
                isOwn={isOwn}
              />
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </CardContent>
    </Card>
  );
};

export default MessagesList;
