import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Gift, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { logger } from '@/utils/environmentUtils';

interface AnalyticsData {
  conversionRate: number;
  topReferrers: Array<{
    user_id: string;
    full_name: string;
    total_referrals: number;
    total_points: number;
  }>;
  monthlyGrowth: number;
  averagePointsPerUser: number;
}

interface ReferralAnalyticsProps {
  className?: string;
}

export const ReferralAnalytics: React.FC<ReferralAnalyticsProps> = ({ className }) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      logger.info('Récupération des analytics de parrainage');

      // Récupérer les données d'analytics
      const [conversionData, topReferrersData, growthData, averageData] = await Promise.all([
        calculateConversionRate(),
        getTopReferrers(),
        calculateMonthlyGrowth(),
        calculateAveragePoints()
      ]);

      setAnalytics({
        conversionRate: conversionData,
        topReferrers: topReferrersData,
        monthlyGrowth: growthData,
        averagePointsPerUser: averageData
      });
    } catch (error) {
      logger.error('Erreur lors de la récupération des analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateConversionRate = async (): Promise<number> => {
    // Simuler un calcul de taux de conversion
    // En production, cela viendrait de vraies métriques
    return Math.random() * 15 + 5; // 5-20%
  };

  const getTopReferrers = async () => {
    const { data, error } = await supabase
      .from('referral_points')
      .select('user_id, total_points, total_referrals_level_1')
      .gt('total_referrals_level_1', 0)
      .order('total_points', { ascending: false })
      .limit(5);

    if (error) {
      logger.error('Erreur récupération top referrers:', error);
      return [];
    }

    if (!data) return [];

    // Récupérer les profils séparément
    const userIds = data.map(item => item.user_id);
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds);

    return data.map(item => {
      const profile = profiles?.find(p => p.id === item.user_id);
      return {
        user_id: item.user_id,
        full_name: profile?.full_name || 'Utilisateur anonyme',
        total_referrals: item.total_referrals_level_1,
        total_points: item.total_points
      };
    });
  };

  const calculateMonthlyGrowth = async (): Promise<number> => {
    // Calculer la croissance mensuelle des parrainages
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    
    const { data, error } = await supabase
      .from('referral_relationships')
      .select('created_at')
      .gte('created_at', lastMonth.toISOString());

    if (error) {
      logger.error('Erreur calcul croissance:', error);
      return 0;
    }

    // Retourner un pourcentage de croissance simulé
    return (data?.length || 0) * 2.5;
  };

  const calculateAveragePoints = async (): Promise<number> => {
    const { data, error } = await supabase
      .from('referral_points')
      .select('total_points')
      .gt('total_points', 0);

    if (error) {
      logger.error('Erreur calcul moyenne points:', error);
      return 0;
    }

    if (!data || data.length === 0) return 0;

    const total = data.reduce((sum, item) => sum + item.total_points, 0);
    return Math.round(total / data.length * 100) / 100;
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Analytics de performance</CardTitle>
          <CardDescription>Chargement des métriques...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className={`grid gap-4 md:grid-cols-2 lg:grid-cols-4 ${className}`}>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taux de conversion</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.conversionRate.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            Codes utilisés vs générés
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Croissance mensuelle</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">+{analytics.monthlyGrowth.toFixed(0)}</div>
          <p className="text-xs text-muted-foreground">
            Nouveaux parrainages ce mois
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Moyenne points</CardTitle>
          <Gift className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.averagePointsPerUser}</div>
          <p className="text-xs text-muted-foreground">
            Points par utilisateur actif
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top referrers</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{analytics.topReferrers.length}</div>
          <p className="text-xs text-muted-foreground">
            Utilisateurs actifs
          </p>
        </CardContent>
      </Card>

      {analytics.topReferrers.length > 0 && (
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-lg">Meilleurs parrains</CardTitle>
            <CardDescription>Top 5 des utilisateurs par points de parrainage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics.topReferrers.map((referrer, index) => (
                <div key={referrer.user_id} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center gap-3">
                    <Badge variant={index === 0 ? "default" : "secondary"}>
                      #{index + 1}
                    </Badge>
                    <div>
                      <div className="font-medium">{referrer.full_name}</div>
                      <div className="text-sm text-muted-foreground">
                        {referrer.total_referrals} parrainage{referrer.total_referrals > 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-primary">{referrer.total_points} pts</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};