
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Check, X, TrendingUp } from 'lucide-react';

const ModerationStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['moderation-detailed-stats'],
    queryFn: async () => {
      const [
        pendingCount,
        approvedCount,
        rejectedCount,
        todayModerated
      ] = await Promise.all([
        supabase.from('ads').select('id', { count: 'exact' }).eq('moderation_status', 'pending'),
        supabase.from('ads').select('id', { count: 'exact' }).eq('moderation_status', 'approved'),
        supabase.from('ads').select('id', { count: 'exact' }).eq('moderation_status', 'rejected'),
        supabase
          .from('ads')
          .select('id', { count: 'exact' })
          .not('moderated_at', 'is', null)
          .gte('moderated_at', new Date().toISOString().split('T')[0])
      ]);

      return {
        pending: pendingCount.count || 0,
        approved: approvedCount.count || 0,
        rejected: rejectedCount.count || 0,
        todayModerated: todayModerated.count || 0
      };
    }
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded animate-pulse w-20" />
              <div className="h-4 w-4 bg-muted rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded animate-pulse w-16 mb-2" />
              <div className="h-3 bg-muted rounded animate-pulse w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const statsData = [
    {
      title: "En attente",
      value: stats?.pending || 0,
      description: "Annonces à modérer",
      icon: Clock,
      color: "text-yellow-600"
    },
    {
      title: "Approuvées",
      value: stats?.approved || 0,
      description: "Total approuvé",
      icon: Check,
      color: "text-green-600"
    },
    {
      title: "Rejetées",
      value: stats?.rejected || 0,
      description: "Total rejeté",
      icon: X,
      color: "text-red-600"
    },
    {
      title: "Aujourd'hui",
      value: stats?.todayModerated || 0,
      description: "Modérées aujourd'hui",
      icon: TrendingUp,
      color: "text-blue-600"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statsData.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default ModerationStats;
