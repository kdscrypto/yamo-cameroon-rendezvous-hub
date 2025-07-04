
import { format, isToday, isYesterday } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Paperclip, Download } from 'lucide-react';
import { Message } from './types';

interface WhatsAppMessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showDateHeader?: boolean;
}

const WhatsAppMessageBubble = ({ message, isOwn, showDateHeader }: WhatsAppMessageBubbleProps) => {
  const formatMessageDate = (date: string) => {
    const messageDate = new Date(date);
    if (isToday(messageDate)) {
      return "Aujourd'hui";
    } else if (isYesterday(messageDate)) {
      return "Hier";
    } else {
      return format(messageDate, 'EEEE d MMMM', { locale: fr });
    }
  };

  const formatMessageTime = (date: string) => {
    return format(new Date(date), 'HH:mm');
  };

  return (
    <>
      {showDateHeader && (
        <div className="flex justify-center my-4">
          <div className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-xs text-gray-600 dark:text-gray-300">
            {formatMessageDate(message.created_at)}
          </div>
        </div>
      )}
      
      <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-1`}>
        <div
          className={`max-w-[75%] rounded-lg px-3 py-2 ${
            isOwn
              ? 'bg-green-500 text-white rounded-br-sm'
              : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-bl-sm'
          }`}
          style={{
            wordWrap: 'break-word',
            overflowWrap: 'break-word'
          }}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
          
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
          
          <div className={`flex justify-end items-center mt-1 gap-1 ${isOwn ? 'text-green-100' : 'text-gray-500'}`}>
            <span className="text-xs">
              {formatMessageTime(message.created_at)}
            </span>
            {isOwn && (
              <div className="flex">
                <svg className="w-4 h-4" viewBox="0 0 16 15" fill="none">
                  <path
                    d="M10.91 3.316l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.879a.32.32 0 0 1-.484.033L1.891 7.769a.365.365 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"
                    fill={message.is_read ? "#4fc3f7" : "currentColor"}
                  />
                  {message.is_read && (
                    <path
                      d="M14.91 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.566 9.879a.32.32 0 0 1-.484.033L5.891 7.769a.365.365 0 0 0-.515.006l-.423.433a.364.364 0 0 0 .006.514l3.258 3.185c.143.14.361.125.484-.033l6.272-8.048a.365.365 0 0 0-.063-.51z"
                      fill="#4fc3f7"
                    />
                  )}
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default WhatsAppMessageBubble;
