
import { Message } from '@/components/dashboard/ConversationView/types';

export interface Attachment {
  url: string;
  name: string;
  type: string;
  size: number;
}

export interface SendMessageFunction {
  (content: string, attachments?: Attachment[]): Promise<void>;
}

// This hook is just for type exports, no runtime logic needed
export const useConversationTypes = () => {
  return {};
};
