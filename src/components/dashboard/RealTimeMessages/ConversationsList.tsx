
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus } from 'lucide-react';
import ConversationCard from './ConversationCard';

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

interface ConversationsListProps {
  conversations: Conversation[] | undefined;
  currentUserId: string;
  onConversationSelect: (conversationId: string) => void;
  onComposeOpen: () => void;
}

const ConversationsList = ({ 
  conversations, 
  currentUserId, 
  onConversationSelect, 
  onComposeOpen 
}: ConversationsListProps) => {
  if (!conversations || conversations.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-white mb-4">Aucune conversation pour le moment.</p>
          <Button 
            onClick={onComposeOpen}
            className="bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-500 font-semibold shadow-lg transform hover:scale-105 transition-all duration-200 px-6 py-3"
          >
            <Plus className="w-5 h-5 mr-2" />
            Commencer une conversation
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {conversations.map((conversation) => (
        <ConversationCard
          key={conversation.id}
          conversation={conversation}
          currentUserId={currentUserId}
          onSelect={onConversationSelect}
        />
      ))}
    </div>
  );
};

export default ConversationsList;
