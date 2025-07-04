
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

export const useConversationTypes = () => {
  return {
    Attachment,
    SendMessageFunction
  };
};
