
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip } from 'lucide-react';
import { toast } from 'sonner';
import AttachmentUpload from './AttachmentUpload';
import MessageTypingIndicator from './MessageTypingIndicator';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { Attachment } from './types';

interface MessageInputProps {
  conversationId: string;
  onSendMessage: (content: string, attachments?: Attachment[]) => Promise<void>;
  isLoading: boolean;
  isRateLimited: boolean;
}

const MessageInput = ({ conversationId, onSendMessage, isLoading, isRateLimited }: MessageInputProps) => {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
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

  const handleMessageChange = (value: string) => {
    setMessage(value);
    
    if (!isTyping && value.trim()) {
      setIsTyping(true);
    }
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    if (value.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 1000);
    } else {
      setIsTyping(false);
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="border-t bg-background p-4 space-y-4">
      <MessageTypingIndicator 
        conversationId={conversationId} 
        isTyping={isTyping}
      />
      
      <Collapsible open={showAttachments} onOpenChange={setShowAttachments}>
        <CollapsibleContent>
          <AttachmentUpload
            onAttachmentsChange={setAttachments}
            maxFiles={5}
            maxSizeInMB={10}
          />
        </CollapsibleContent>
      </Collapsible>

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
              className="min-h-[60px] max-h-[200px] resize-none text-white bg-muted/50 border-muted"
              rows={2}
            />
            
            <div className="flex justify-between items-center mt-1 text-xs text-white">
              <span className="text-yellow-500">{message.length}/2000 caractères</span>
              {attachments.length > 0 && (
                <span className="text-white">{attachments.length} fichier{attachments.length > 1 ? 's' : ''} joint{attachments.length > 1 ? 's' : ''}</span>
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
              className="bg-muted hover:bg-muted/80 text-white border-muted"
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
              className="bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-500 font-semibold shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {isRateLimited && (
          <div className="text-sm text-orange-600 bg-orange-50 p-2 rounded">
            ⚠️ Limite de messages atteinte. Veuillez attendre avant d'envoyer un autre message.
          </div>
        )}

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

