
import TypingIndicator from './TypingState';

interface MessageTypingIndicatorProps {
  conversationId: string;
  isTyping: boolean;
}

const MessageTypingIndicator = ({ conversationId, isTyping }: MessageTypingIndicatorProps) => {
  return <TypingIndicator conversationId={conversationId} isTyping={isTyping} />;
};

export default MessageTypingIndicator;
