import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Send, Paperclip, Download } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';

interface Message {
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

interface ConversationViewProps {
  conversationId: string;
  onBack: () => void;
}

const ConversationView = ({ conversationId, onBack }: ConversationViewProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversation } = useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          ads(title, id)
        `)
        .eq('id', conversationId)
        .single();
      
      if (error) {
        console.error('Error fetching conversation:', error);
        return null;
      }
      
      return data;
    }
  });

  const { data: messages, isLoading } = useQuery({
    queryKey: ['conversation-messages', conversationId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          message_attachments(*)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching messages:', error);
        return [];
      }
      
      return data as Message[];
    }
  });

  // Mark messages as read when viewing conversation
  useEffect(() => {
    if (!user || !messages) return;

    const unreadMessages = messages.filter(
      msg => msg.recipient_id === user.id && !msg.is_read
    );

    if (unreadMessages.length > 0) {
      const markAsRead = async () => {
        const { error } = await supabase
          .from('messages')
          .update({ is_read: true })
          .in('id', unreadMessages.map(msg => msg.id));
        
        if (error) {
          console.error('Error marking messages as read:', error);
        }
      };

      markAsRead();
    }
  }, [messages, user]);

  // Set up real-time subscription for new messages
  useEffect(() => {
    if (!conversationId) return;

    console.log('Setting up real-time subscription for conversation:', conversationId);

    const channel = supabase
      .channel(`conversation-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('New message in conversation:', payload);
          queryClient.invalidateQueries({ queryKey: ['conversation-messages', conversationId] });
          
          // Show notification for new messages from others
          if (payload.new.sender_id !== user?.id) {
            toast.success('Nouveau message reçu');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user, queryClient]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!user || !conversation) throw new Error('User or conversation not found');

      // Safely handle participants as Json type
      const participants = Array.isArray(conversation.participants) 
        ? conversation.participants 
        : [];
      
      const otherParticipant = participants.find((p: string) => p !== user.id);
      if (!otherParticipant) throw new Error('Other participant not found');

      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: otherParticipant,
          conversation_id: conversationId,
          content: content.trim(),
          ad_id: conversation.ad_id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setNewMessage('');
      queryClient.invalidateQueries({ queryKey: ['conversation-messages', conversationId] });
      toast.success('Message envoyé');
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast.error('Erreur lors de l\'envoi du message');
    }
  });

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    sendMessageMutation.mutate(newMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="h-6 bg-muted rounded animate-pulse w-48" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getOtherParticipant = () => {
    if (!conversation) return 'Utilisateur inconnu';
    
    // Safely handle participants as Json type
    const participants = Array.isArray(conversation.participants) 
      ? conversation.participants 
      : [];
    
    const otherParticipantId = participants.find((p: string) => p !== user?.id);
    return otherParticipantId || 'Utilisateur inconnu';
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold">
            {conversation?.ads ? `Re: ${conversation.ads.title}` : 'Conversation directe'}
          </h2>
          <p className="text-muted-foreground">
            Avec: {getOtherParticipant()}
          </p>
        </div>
      </div>

      {/* Messages */}
      <Card className="min-h-[500px] flex flex-col">
        <CardContent className="flex-1 p-4 overflow-y-auto max-h-[500px]">
          <div className="space-y-4">
            {messages?.map((message) => {
              const isOwn = message.sender_id === user?.id;
              
              return (
                <div
                  key={message.id}
                  className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      isOwn
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    
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
                    
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-xs opacity-70">
                        {new Date(message.created_at).toLocaleTimeString('fr-FR', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {isOwn && (
                        <span className="text-xs opacity-70">
                          {message.is_read ? 'Lu' : 'Envoyé'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Tapez votre message..."
              className="min-h-[60px] resize-none"
              disabled={sendMessageMutation.isPending}
            />
            <div className="flex flex-col gap-2">
              <Button
                size="icon"
                variant="outline"
                disabled
                title="Pièces jointes (bientôt disponible)"
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sendMessageMutation.isPending}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ConversationView;
