
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, FileText, Eye, Calendar } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

const DashboardStats = () => {
  const { user } = useAuth();

  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // Fetch real-time counts directly from the ads table
      const { data: adsData, error: adsError } = await supabase
        .from('ads')
        .select('status, moderation_status')
        .eq('user_id', user.id);
      
      if (adsError) {
        console.error('Error fetching ads for stats:', adsError);
      }
      
      // Fetch real-time message counts
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('is_read')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);
      
      if (messagesError) {
        console.error('Error fetching messages for stats:', messagesError);
      }
      
      // Calculate real-time stats
      const totalAds = adsData?.length || 0;
      const activeAds = adsData?.filter(ad => ad.status === 'active' && ad.moderation_status === 'approved').length || 0;
      const totalMessages = messagesData?.length || 0;
      const unreadMessages = messagesData?.filter(msg => !msg.is_read).length || 0;
      
      return {
        total_ads: totalAds,
        active_ads: activeAds,
        total_messages: totalMessages,
        unread_messages: unreadMessages
      };
    },
    enabled: !!user,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
  });

  // Set up real-time subscription for ads and messages
  useEffect(() => {
    if (!user) return;

    console.log('Setting up real-time subscription for dashboard stats');

    const adsChannel = supabase
      .channel('dashboard-ads-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ads',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Ads updated for dashboard stats:', payload);
          refetch();
        }
      )
      .subscribe();

    const messagesChannel = supabase
      .channel('dashboard-messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Messages updated for dashboard stats:', payload);
          refetch();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Received messages updated for dashboard stats:', payload);
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(adsChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [user, refetch]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-border">
            <CardHeader>
              <div className="h-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: "Annonces totales",
      value: stats?.total_ads || 0,
      description: "Toutes vos annonces",
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Annonces actives",
      value: stats?.active_ads || 0,
      description: "Annonces en ligne",
      icon: Calendar,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      title: "Messages",
      value: stats?.total_messages || 0,
      description: "Total des messages",
      icon: MessageSquare,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Messages non lus",
      value: stats?.unread_messages || 0,
      description: "Nouveaux messages",
      icon: MessageSquare,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statsData.map((stat) => (
        <Card key={stat.title} className="border-border hover:shadow-lg hover:shadow-primary/10 transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardStats;
