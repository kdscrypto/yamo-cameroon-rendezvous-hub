
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, MailOpen, Reply } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const UserMessages = () => {
  const { user } = useAuth();

  const { data: messages, isLoading, refetch } = useQuery({
    queryKey: ['user-messages', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          ads(title)
        `)
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching user messages:', error);
        return [];
      }
      
      return data;
    },
    enabled: !!user
  });

  const markAsRead = async (messageId: string) => {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('id', messageId);
    
    if (error) {
      console.error('Error marking message as read:', error);
    } else {
      refetch();
    }
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Messages</h2>
      </div>

      {!messages || messages.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Mail className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucun message pour le moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => {
            const isReceived = message.recipient_id === user?.id;
            const isUnread = isReceived && !message.is_read;
            
            return (
              <Card key={message.id} className={isUnread ? 'border-primary' : ''}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {isUnread ? (
                          <Mail className="w-4 h-4 text-primary" />
                        ) : (
                          <MailOpen className="w-4 h-4 text-muted-foreground" />
                        )}
                        {message.subject || 'Sans sujet'}
                      </CardTitle>
                      <CardDescription>
                        {isReceived ? 'Reçu' : 'Envoyé'} • {new Date(message.created_at).toLocaleDateString('fr-FR')}
                        {message.ads && (
                          <span> • Annonce: {message.ads.title}</span>
                        )}
                      </CardDescription>
                    </div>
                    {isUnread && (
                      <Badge variant="default">Nouveau</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4 whitespace-pre-wrap">
                    {message.content}
                  </p>
                  <div className="flex gap-2">
                    {isReceived && isUnread && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => markAsRead(message.id)}
                      >
                        <MailOpen className="w-4 h-4 mr-2" />
                        Marquer comme lu
                      </Button>
                    )}
                    {isReceived && (
                      <Button variant="outline" size="sm">
                        <Reply className="w-4 h-4 mr-2" />
                        Répondre
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserMessages;
