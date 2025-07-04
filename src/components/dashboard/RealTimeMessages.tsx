import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, MailOpen, MessageSquare, Plus, Send, Users, Search, Archive } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import ConversationView from './ConversationView';
import ComposeMessageModal from './ComposeMessageModal';
import AdvancedMessageSearch from './MessageSearch/AdvancedMessageSearch';

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

const RealTimeMessages = () => {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('conversations');

  const { data: conversations, isLoading, refetch } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      console.log('Fetching conversations for user:', user.id);
      
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          ads(title)
        `)
        .order('last_message_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching conversations:', error);
        return [];
      }
      
      // Fetch unread message counts and last messages for each conversation
      const conversationsWithDetails = await Promise.all(
        data.map(async (conversation) => {
          // Get unread count
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conversation.id)
            .eq('recipient_id', user.id)
            .eq('is_read', false);

          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('content, sender_id')
            .eq('conversation_id', conversation.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          return {
            ...conversation,
            unread_count: unreadCount || 0,
            last_message: lastMessage
          };
        })
      );
      
      console.log('Fetched conversations with details:', conversationsWithDetails);
      return conversationsWithDetails as Conversation[];
    },
    enabled: !!user
  });

  // Set up real-time subscription for conversations
  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time subscription for conversations');

    const channel = supabase
      .channel('conversations-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          console.log('Conversation updated:', payload);
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('Message updated:', payload);
          refetch();
          
          // Show notification for new messages
          if (payload.eventType === 'INSERT' && payload.new.recipient_id === user.id) {
            toast.success('Nouveau message reçu');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, refetch]);

  const getOtherParticipant = (participants: string[]) => {
    return participants.find(p => p !== user?.id) || 'Utilisateur inconnu';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-4 bg-muted rounded animate-pulse" />
              <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
            </CardHeader>
            <CardContent>
              <div className="h-16 bg-muted rounded animate-pulse" />
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
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="w-6 h-6" />
            Messages
          </h2>
          <p className="text-muted-foreground">Gérez vos conversations en temps réel</p>
        </div>
        <Button onClick={() => setIsComposeOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau message
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversations</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversations?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Conversations actives</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Non lus</CardTitle>
            <Mail className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {conversations?.reduce((sum, conv) => sum + (conv.unread_count || 0), 0) || 0}
            </div>
            <p className="text-xs text-muted-foreground">Messages non lus</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Récents</CardTitle>
            <MessageSquare className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {conversations?.filter(conv => {
                const lastMessageTime = new Date(conv.last_message_at);
                const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
                return lastMessageTime > oneDayAgo;
              }).length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Dernières 24h</p>
          </CardContent>
        </Card>
      </div>

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

        <TabsContent value="conversations" className="mt-6">
          {!conversations || conversations.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Aucune conversation pour le moment.</p>
                <Button onClick={() => setIsComposeOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Commencer une conversation
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {conversations.map((conversation) => {
                const hasUnread = (conversation.unread_count || 0) > 0;
                
                return (
                  <Card 
                    key={conversation.id} 
                    className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                      hasUnread ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => setSelectedConversation(conversation.id)}
                  >
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-lg flex items-center gap-2">
                            {hasUnread ? (
                              <Mail className="w-4 h-4 text-primary" />
                            ) : (
                              <MailOpen className="w-4 h-4 text-muted-foreground" />
                            )}
                            {conversation.ads ? (
                              `Re: ${conversation.ads.title}`
                            ) : (
                              'Conversation directe'
                            )}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            <span>Avec: {getOtherParticipant(conversation.participants)}</span>
                            <span>•</span>
                            <span>{new Date(conversation.last_message_at).toLocaleDateString('fr-FR')}</span>
                            {conversation.ads && (
                              <>
                                <span>•</span>
                                <span className="text-primary">Annonce: {conversation.ads.title}</span>
                              </>
                            )}
                          </CardDescription>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {hasUnread && (
                            <Badge variant="default" className="bg-primary">
                              {conversation.unread_count} nouveau{(conversation.unread_count || 0) > 1 ? 'x' : ''}
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {new Date(conversation.last_message_at).toLocaleTimeString('fr-FR', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    
                    {conversation.last_message && (
                      <CardContent>
                        <div className="flex justify-between items-center">
                          <p className="text-sm text-muted-foreground truncate flex-1">
                            {conversation.last_message.sender_id === user?.id ? 'Vous: ' : ''}
                            {conversation.last_message.content}
                          </p>
                          <Button variant="ghost" size="sm" className="ml-4">
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="search" className="mt-6">
          <AdvancedMessageSearch 
            onMessageSelect={(conversationId) => setSelectedConversation(conversationId)}
          />
        </TabsContent>

        <TabsContent value="archived" className="mt-6">
          <Card>
            <CardContent className="text-center py-12">
              <Archive className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Fonctionnalité d'archivage à venir.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Compose Message Modal */}
      <ComposeMessageModal 
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onMessageSent={() => {
          refetch();
          toast.success('Message envoyé avec succès');
        }}
      />
    </div>
  );
};

export default RealTimeMessages;
