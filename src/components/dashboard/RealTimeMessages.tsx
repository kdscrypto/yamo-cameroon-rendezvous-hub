
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Plus, Search, Archive } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useState } from 'react';
// import { toast } from 'sonner'; // Temporairement désactivé
import ConversationView from './ConversationView';
import ComposeMessageModal from './ComposeMessageModal';
import MessagesSummaryStats from './RealTimeMessages/MessagesSummaryStats';
import MessagesTabsContent from './RealTimeMessages/MessagesTabsContent';
import { useConversationsData } from './RealTimeMessages/useConversationsData';

const RealTimeMessages = () => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('conversations');

  const { conversations, isLoading, refetch } = useConversationsData();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
                <div className="h-16 bg-muted rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // If a conversation is selected, show the conversation view
  if (selectedConversation) {
    return (
      <ConversationView 
        conversationId={selectedConversation}
        onBack={() => setSelectedConversation(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2 text-yellow-500">
            <MessageSquare className="w-6 h-6" />
            Messages
          </h2>
          <p className="text-white">Gérez vos conversations en temps réel</p>
        </div>
        <Button 
          onClick={() => setIsComposeOpen(true)}
          className="bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-500 font-semibold shadow-lg transform hover:scale-105 transition-all duration-200 px-6 py-3"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nouveau message
        </Button>
      </div>

      {/* Summary Stats */}
      <MessagesSummaryStats conversations={conversations || []} />

      {/* Tabs for different views */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-secondary">
          <TabsTrigger value="conversations" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <MessageSquare className="w-4 h-4 mr-2" />
            Conversations
          </TabsTrigger>
          <TabsTrigger value="search" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Search className="w-4 h-4 mr-2" />
            Recherche
          </TabsTrigger>
          <TabsTrigger value="archived" className="data-[state=active]:bg-primary data-[state=active]:text-white">
            <Archive className="w-4 h-4 mr-2" />
            Archivées
          </TabsTrigger>
        </TabsList>

        <MessagesTabsContent
          conversations={conversations}
          currentUserId={user?.id || ''}
          onConversationSelect={setSelectedConversation}
          onComposeOpen={() => setIsComposeOpen(true)}
        />
      </Tabs>

      {/* Compose Message Modal */}
      <ComposeMessageModal 
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onMessageSent={() => {
          refetch();
          console.log('Toast: Message envoyé avec succès');
        }}
      />
    </div>
  );
};

export default RealTimeMessages;
