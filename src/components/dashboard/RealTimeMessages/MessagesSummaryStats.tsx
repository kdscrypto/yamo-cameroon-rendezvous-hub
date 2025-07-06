
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Users, MessageSquare } from 'lucide-react';

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

interface MessagesSummaryStatsProps {
  conversations: Conversation[];
}

const MessagesSummaryStats = ({ conversations }: MessagesSummaryStatsProps) => {
  const totalUnread = conversations?.reduce((sum, conv) => sum + (conv.unread_count || 0), 0) || 0;
  
  const recentCount = conversations?.filter(conv => {
    const lastMessageTime = new Date(conv.last_message_at);
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return lastMessageTime > oneDayAgo;
  }).length || 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversations</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{conversations?.length || 0}</div>
          <p className="text-xs text-muted-foreground">Conversations actives</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Non lus</CardTitle>
          <Mail className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{totalUnread}</div>
          <p className="text-xs text-muted-foreground">Messages non lus</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Récents</CardTitle>
          <MessageSquare className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">{recentCount}</div>
          <p className="text-xs text-muted-foreground">Dernières 24h</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessagesSummaryStats;
