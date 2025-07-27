import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdvancedAnalytics } from './useAdvancedAnalytics';

interface BusinessMetrics {
  revenue: number;
  revenueGrowth: number;
  arpu: number; // Average Revenue Per User
  ltv: number; // Lifetime Value
  churnRate: number;
  acquisitionCost: number;
  monthlyRecurring: number;
  profitMargin: number;
  revenueBySegment: Array<{
    segment: string;
    revenue: number;
    percentage: number;
  }>;
  forecastData: Array<{
    month: string;
    projected: number;
    actual?: number;
  }>;
  keyDrivers: Array<{
    metric: string;
    impact: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}

interface BusinessInsight {
  type: 'opportunity' | 'risk' | 'trend';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  metrics: string[];
}

export const useBusinessIntelligence = () => {
  const { analyticsData } = useAdvancedAnalytics();

  const { data: businessMetrics, isLoading, error } = useQuery({
    queryKey: ['business-intelligence'],
    queryFn: async () => {
      try {
        // In a real app, this would connect to payment/billing data
        // For now, we'll simulate business metrics based on user activity
        
        const { data: users } = await supabase
          .from('profiles')
          .select('created_at, last_active_at');

        const { data: ads } = await supabase
          .from('ads')
          .select('created_at, user_id, views');

        // Simulate revenue calculations
        const totalUsers = users?.length || 0;
        const premiumUsers = Math.floor(totalUsers * 0.15); // 15% conversion to premium
        const monthlyRevenue = premiumUsers * 9.99; // €9.99/month subscription
        
        const metrics: BusinessMetrics = {
          revenue: monthlyRevenue,
          revenueGrowth: 18.5,
          arpu: totalUsers > 0 ? monthlyRevenue / totalUsers : 0,
          ltv: 89.99, // Average lifetime value
          churnRate: 5.2,
          acquisitionCost: 12.50,
          monthlyRecurring: monthlyRevenue * 0.85,
          profitMargin: 68.3,
          revenueBySegment: [
            { segment: 'Abonnements Premium', revenue: monthlyRevenue * 0.7, percentage: 70 },
            { segment: 'Publicité', revenue: monthlyRevenue * 0.2, percentage: 20 },
            { segment: 'Services', revenue: monthlyRevenue * 0.1, percentage: 10 }
          ],
          forecastData: generateRevenueForecast(monthlyRevenue),
          keyDrivers: [
            { metric: 'Taux de conversion', impact: 23, trend: 'up' },
            { metric: 'Engagement utilisateur', impact: 18, trend: 'up' },
            { metric: 'Coût d\'acquisition', impact: -12, trend: 'down' },
            { metric: 'Rétention', impact: 15, trend: 'stable' }
          ]
        };

        return metrics;
      } catch (error) {
        console.error('Error fetching business intelligence:', error);
        throw error;
      }
    },
    refetchInterval: 10 * 60 * 1000, // Refresh every 10 minutes
  });

  const { data: businessInsights } = useQuery({
    queryKey: ['business-insights', analyticsData],
    queryFn: async () => {
      if (!analyticsData || !businessMetrics) return [];

      const insights: BusinessInsight[] = [];

      // Growth opportunity insights
      if (analyticsData.userGrowth > 20) {
        insights.push({
          type: 'opportunity',
          title: 'Croissance accélérée détectée',
          description: `La croissance utilisateur de ${analyticsData.userGrowth}% offre une opportunité d'expansion.`,
          priority: 'high',
          actionable: true,
          metrics: ['userGrowth', 'activeUsers']
        });
      }

      // Performance insights
      if (analyticsData.performanceScore < 70) {
        insights.push({
          type: 'risk',
          title: 'Performance dégradée',
          description: 'Le score de performance est en dessous du seuil optimal.',
          priority: 'high',
          actionable: true,
          metrics: ['performanceScore']
        });
      }

      // Revenue insights
      if (businessMetrics.revenueGrowth > 15) {
        insights.push({
          type: 'trend',
          title: 'Tendance revenue positive',
          description: `Croissance des revenus de ${businessMetrics.revenueGrowth}% ce mois.`,
          priority: 'medium',
          actionable: false,
          metrics: ['revenue', 'revenueGrowth']
        });
      }

      // Churn risk
      if (businessMetrics.churnRate > 8) {
        insights.push({
          type: 'risk',
          title: 'Taux de churn élevé',
          description: 'Le taux de churn dépasse les standards de l\'industrie.',
          priority: 'high',
          actionable: true,
          metrics: ['churnRate', 'ltv']
        });
      }

      // Scalability insights
      if (analyticsData.scalabilityIndex < 50) {
        insights.push({
          type: 'risk',
          title: 'Contraintes de scalabilité',
          description: 'L\'infrastructure pourrait nécessiter une optimisation.',
          priority: 'medium',
          actionable: true,
          metrics: ['scalabilityIndex']
        });
      }

      return insights;
    },
    enabled: !!analyticsData && !!businessMetrics,
  });

  return {
    businessMetrics,
    businessInsights: businessInsights || [],
    isLoading,
    error
  };
};

// Helper function to generate revenue forecast
const generateRevenueForecast = (currentRevenue: number) => {
  const forecast = [];
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  const currentMonth = new Date().getMonth();
  
  for (let i = 0; i < 12; i++) {
    const monthIndex = (currentMonth + i) % 12;
    const isHistorical = i < 6;
    const growthRate = 0.15; // 15% monthly growth
    const projected = currentRevenue * Math.pow(1 + growthRate, i);
    
    forecast.push({
      month: months[monthIndex],
      projected: Math.round(projected),
      actual: isHistorical ? Math.round(projected * (0.85 + Math.random() * 0.3)) : undefined
    });
  }
  
  return forecast;
};