
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, Calendar, Mail, Clock } from 'lucide-react';

const WaitlistStats = () => {
  const { data: detailedStats } = useQuery({
    queryKey: ['waitlist-detailed-stats'],
    queryFn: async () => {
      const [
        totalCount,
        todayCount,
        thisWeekCount,
        notifiedCount,
        recentGrowth
      ] = await Promise.all([
        // Total inscriptions
        supabase.from('event_waitlist').select('id', { count: 'exact' }),
        
        // Inscriptions aujourd'hui
        supabase
          .from('event_waitlist')
          .select('id', { count: 'exact' })
          .gte('created_at', new Date().toISOString().split('T')[0]),
        
        // Inscriptions cette semaine
        supabase
          .from('event_waitlist')
          .select('id', { count: 'exact' })
          .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        
        // Personnes notifiées
        supabase.from('event_waitlist').select('id', { count: 'exact' }).eq('notified', true),
        
        // Croissance par rapport à la semaine dernière
        supabase
          .from('event_waitlist')
          .select('id', { count: 'exact' })
          .gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString())
          .lt('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      const currentWeekCount = thisWeekCount.count || 0;
      const lastWeekCount = (recentGrowth.count || 0);
      const growthRate = lastWeekCount > 0 ? ((currentWeekCount - lastWeekCount) / lastWeekCount) * 100 : 0;

      return {
        total: totalCount.count || 0,
        today: todayCount.count || 0,
        thisWeek: currentWeekCount,
        notified: notifiedCount.count || 0,
        pending: (totalCount.count || 0) - (notifiedCount.count || 0),
        growthRate: Math.round(growthRate * 10) / 10
      };
    },
    refetchInterval: 30000 // Actualise toutes les 30 secondes
  });

  const stats = [
    {
      title: "Total inscriptions",
      value: detailedStats?.total || 0,
      description: "Personnes inscrites",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Aujourd'hui",
      value: detailedStats?.today || 0,
      description: "Nouvelles inscriptions",
      icon: Calendar,
      color: "text-green-600"
    },
    {
      title: "Cette semaine",
      value: detailedStats?.thisWeek || 0,
      description: `${detailedStats?.growthRate ? (detailedStats.growthRate > 0 ? '+' : '') + detailedStats.growthRate + '%' : 'vs semaine dernière'}`,
      icon: detailedStats?.growthRate && detailedStats.growthRate >= 0 ? TrendingUp : TrendingDown,
      color: detailedStats?.growthRate && detailedStats.growthRate >= 0 ? "text-green-600" : "text-red-600"
    },
    {
      title: "En attente",
      value: detailedStats?.pending || 0,
      description: "Non notifiées",
      icon: Clock,
      color: "text-yellow-600"
    },
    {
      title: "Notifiées",
      value: detailedStats?.notified || 0,
      description: "Déjà contactées",
      icon: Mail,
      color: "text-purple-600"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat) => {
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
              <p className={`text-xs ${stat.color === 'text-red-600' ? 'text-red-600' : 'text-muted-foreground'}`}>
                {stat.description}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default WaitlistStats;
