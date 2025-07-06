
import { TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Archive } from 'lucide-react';
import ConversationsList from './ConversationsList';
import AdvancedMessageSearch from '../MessageSearch/AdvancedMessageSearch';

interface Conversation {
  id: string;
  participants: string[];
  ad_id?: string;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  ads?: {
    title: string;
  };
  unread_count?: number;
  last_message?: {
    content: string;
    sender_id: string;
  };
}

interface MessagesTabsContentProps {
  conversations: Conversation[] | undefined;
  currentUserId: string;
  onConversationSelect: (conversationId: string) => void;
  onComposeOpen: () => void;
}

const MessagesTabsContent = ({ 
  conversations, 
  currentUserId, 
  onConversationSelect, 
  onComposeOpen 
}: MessagesTabsContentProps) => {
  return (
    <>
      <TabsContent value="conversations" className="mt-6">
        <ConversationsList
          conversations={conversations}
          currentUserId={currentUserId}
          onConversationSelect={onConversationSelect}
          onComposeOpen={onComposeOpen}
        />
      </TabsContent>

      <TabsContent value="search" className="mt-6">
        <AdvancedMessageSearch 
          onMessageSelect={(conversationId) => onConversationSelect(conversationId)}
        />
      </TabsContent>

      <TabsContent value="archived" className="mt-6">
        <Card>
          <CardContent className="text-center py-12">
            <Archive className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-white">Fonctionnalité d'archivage à venir.</p>
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
};

export default MessagesTabsContent;
