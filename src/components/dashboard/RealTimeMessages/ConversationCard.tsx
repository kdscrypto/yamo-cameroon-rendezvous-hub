
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, MailOpen, Send } from 'lucide-react';

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

interface ConversationCardProps {
  conversation: Conversation;
  currentUserId: string;
  onSelect: (conversationId: string) => void;
}

const ConversationCard = ({ conversation, currentUserId, onSelect }: ConversationCardProps) => {
  const hasUnread = (conversation.unread_count || 0) > 0;
  
  const getOtherParticipant = (participants: string[]) => {
    return participants.find(p => p !== currentUserId) || 'Utilisateur inconnu';
  };

  return (
    <Card 
      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
        hasUnread ? 'border-primary bg-primary/5' : ''
      }`}
      onClick={() => onSelect(conversation.id)}
    >
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2 text-yellow-500">
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
            <CardDescription className="flex items-center gap-2 text-white">
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
            <p className="text-sm text-white truncate flex-1">
              {conversation.last_message.sender_id === currentUserId ? 'Vous: ' : ''}
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
};

export default ConversationCard;
