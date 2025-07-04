
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip } from 'lucide-react';
import { toast } from 'sonner';
import AttachmentUpload from './AttachmentUpload';
import MessageTypingIndicator from './MessageTypingIndicator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface MessageInputProps {
  conversationId: string;
  onSendMessage: (content: string, attachments?: Array<{url: string; name: string; type: string; size: number}>) => void;
  isLoading: boolean;
  isRateLimited: boolean;
}

const MessageInput = ({ conversationId, onSendMessage, isLoading, isRateLimited }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Array<{url: string; name: string; type: string; size: number}>>([]);
  const [showAttachments, setShowAttachments] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() && attachments.length === 0) {
      toast.error('Veuillez saisir un message ou ajouter une pièce jointe');
      return;
    }

    if (isRateLimited) {
      toast.error('Limite de messages atteinte. Veuillez attendre.');
      return;
    }

    try {
      await onSendMessage(message.trim(), attachments.length > 0 ? attachments : undefined);
      setMessage('');
      setAttachments([]);
      setShowAttachments(false);
      setIsTyping(false);
      
      // Clear typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Handle typing indicator
  const handleMessageChange = (value: string) => {
    setMessage(value);
    
    // Set typing to true
    if (!isTyping && value.trim()) {
      setIsTyping(true);
    }
    
    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set new timeout to stop typing indicator
    if (value.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 1000);
    } else {
      setIsTyping(false);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="border-t bg-white p-4 space-y-4">
      {/* Typing Indicator */}
      <MessageTypingIndicator 
        conversationId={conversationId} 
        isTyping={isTyping}
      />
      
      {/* Attachments Section */}
      <Collapsible open={showAttachments} onOpenChange={setShowAttachments}>
        <CollapsibleContent>
          <AttachmentUpload
            onAttachmentsChange={setAttachments}
            maxFiles={5}
            maxSizeInMB={10}
          />
        </CollapsibleContent>
      </Collapsible>

      {/* Message Input Form */}
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => handleMessageChange(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tapez votre message..."
              disabled={isLoading || isRateLimited}
              className="min-h-[60px] max-h-[200px] resize-none"
              rows={2}
            />
            
            {/* Character Counter */}
            <div className="flex justify-between items-center mt-1 text-xs text-muted-foreground">
              <span>{message.length}/2000 caractères</span>
              {attachments.length > 0 && (
                <span>{attachments.length} fichier{attachments.length > 1 ? 's' : ''} joint{attachments.length > 1 ? 's' : ''}</span>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAttachments(!showAttachments)}
              disabled={isLoading || isRateLimited}
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            
            <Button
              type="submit"
              disabled={
                isLoading || 
                isRateLimited || 
                (!message.trim() && attachments.length === 0) ||
                message.length > 2000
              }
              size="sm"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Rate Limit Warning */}
        {isRateLimited && (
          <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
            ⚠️ Limite de messages atteinte. Veuillez attendre avant d'envoyer un autre message.
          </div>
        )}

        {/* Character Limit Warning */}
        {message.length > 1800 && (
          <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
            ⚠️ Vous approchez de la limite de caractères ({message.length}/2000)
          </div>
        )}
      </form>
    </div>
  );
};

export default MessageInput;
