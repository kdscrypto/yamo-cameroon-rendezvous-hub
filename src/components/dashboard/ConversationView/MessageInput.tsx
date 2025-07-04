
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip } from 'lucide-react';
import { useTypingIndicator } from '../TypingIndicator';

interface MessageInputProps {
  conversationId: string;
  onSendMessage: (message: string) => void;
  isLoading?: boolean;
  isRateLimited?: boolean;
}

const MessageInput = ({ conversationId, onSendMessage, isLoading, isRateLimited }: MessageInputProps) => {
  const [newMessage, setNewMessage] = useState('');
  const { startTyping, stopTyping } = useTypingIndicator(conversationId);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const handleSendMessage = () => {
    if (!newMessage.trim() || isRateLimited) return;
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
    const value = e.target.value;
    
    // Limit message length
    if (value.length > 2000) return;
    
    setNewMessage(value);
    
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
      {/* Rate limit warning */}
      {isRateLimited && (
        <div className="mb-3 p-2 bg-orange-50 border border-orange-200 rounded-md">
          <p className="text-sm text-orange-800">
            ⚠️ Limite de messages atteinte. Veuillez attendre avant d'envoyer un autre message.
          </p>
        </div>
      )}
      
      <div className="flex gap-2">
        <div className="flex-1">
          <Textarea
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={isRateLimited ? "Limite atteinte..." : "Tapez votre message..."}
            className="min-h-[60px] resize-none"
            disabled={isLoading || isRateLimited}
            maxLength={2000}
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-muted-foreground">
              {newMessage.length}/2000
            </span>
            {newMessage.length > 1800 && (
              <span className="text-xs text-orange-600">
                Limite bientôt atteinte
              </span>
            )}
          </div>
        </div>
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
            disabled={!newMessage.trim() || isLoading || isRateLimited || newMessage.length > 2000}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
