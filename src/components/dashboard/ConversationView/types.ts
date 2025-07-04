
export interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  message_attachments?: Array<{
    id: string;
    file_name: string;
    file_url: string;
    file_type: string;
    file_size?: number;
  }>;
}

export interface ConversationViewProps {
  conversationId: string;
  onBack: () => void;
}

export interface Attachment {
  url: string;
  name: string;
  type: string;
  size: number;
}
