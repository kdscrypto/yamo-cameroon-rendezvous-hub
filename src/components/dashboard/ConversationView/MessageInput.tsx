
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip } from 'lucide-react';
import { useTypingIndicator } from '../TypingIndicator';

interface MessageInputProps {
  conversationId: string;
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
}

const MessageInput = ({ conversationId, onSendMessage, isLoading }: MessageInputProps) => {
  const [newMessage, setNewMessage] = useState('');
  const { startTyping, stopTyping } = useTypingIndicator(conversationId);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage('');
    stopTyping();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    
    // Start typing indicator
    startTyping();
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Stop typing indicator after 2 seconds of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  };

  return (
    <div className="border-t p-4">
      <div className="flex gap-2">
        <Textarea
          value={newMessage}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Tapez votre message..."
          className="min-h-[60px] resize-none"
          disabled={isLoading}
        />
        <div className="flex flex-col gap-2">
          <Button
            size="icon"
            variant="outline"
            disabled
            title="Pièces jointes (bientôt disponible)"
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || isLoading}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
