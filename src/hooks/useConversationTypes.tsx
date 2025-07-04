
import { Message, Attachment } from '@/components/dashboard/ConversationView/types';

export interface SendMessageFunction {
  (content: string, attachments?: Attachment[]): Promise<void>;
}

// This hook is just for type exports, no runtime logic needed
export const useConversationTypes = () => {
  return {};
};
