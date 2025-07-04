
import { Button } from '@/components/ui/button';
import { Paperclip, Download } from 'lucide-react';
import { Message } from './types';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

const MessageBubble = ({ message, isOwn }: MessageBubbleProps) => {
  return (
    <div
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-[70%] rounded-lg p-3 ${
          isOwn
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-foreground'
        }`}
      >
        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
        
        {/* Attachments */}
        {message.message_attachments && message.message_attachments.length > 0 && (
          <div className="mt-2 space-y-1">
            {message.message_attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 p-2 rounded bg-black/10"
              >
                <Paperclip className="w-3 h-3" />
                <span className="text-xs">{attachment.file_name}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-auto p-1"
                  onClick={() => window.open(attachment.file_url, '_blank')}
                >
                  <Download className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}
        
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs opacity-70">
            {new Date(message.created_at).toLocaleTimeString('fr-FR', {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          {isOwn && (
            <span className="text-xs opacity-70">
              {message.is_read ? 'Lu' : 'Envoyé'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
