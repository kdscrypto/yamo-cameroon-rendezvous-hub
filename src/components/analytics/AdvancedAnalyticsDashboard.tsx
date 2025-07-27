import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAdvancedAnalytics } from '@/hooks/useAdvancedAnalytics';
import { useBusinessIntelligence } from '@/hooks/useBusinessIntelligence';
import { UserEngagementChart } from './UserEngagementChart';
import { RevenueAnalytics } from './RevenueAnalytics';
import { PerformanceMetricsChart } from './PerformanceMetricsChart';
import { ScalabilityMonitor } from './ScalabilityMonitor';
import RealTimeMetrics from '../monitoring/RealTimeMetrics';
import { Activity, TrendingUp, Users, DollarSign, Zap, Database } from 'lucide-react';

export const AdvancedAnalyticsDashboard = () => {
  const { analyticsData, isLoading: analyticsLoading } = useAdvancedAnalytics();
  const { businessMetrics, isLoading: businessLoading } = useBusinessIntelligence();

  if (analyticsLoading || businessLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-20"></div>
                <div className="h-4 w-4 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytique Avancée</h1>
          <p className="text-muted-foreground">
            Surveillez les performances, l'engagement utilisateur et la scalabilité
          </p>
        </div>
        <Badge variant="outline" className="bg-primary/10">
          <Activity className="h-3 w-3 mr-1" />
          En temps réel
        </Badge>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{analyticsData?.userGrowth || 0}% ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{businessMetrics?.revenue || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{businessMetrics?.revenueGrowth || 0}% ce mois
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.performanceScore || 0}/100</div>
            <p className="text-xs text-muted-foreground">
              Score de performance global
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scalabilité</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData?.scalabilityIndex || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Indice de scalabilité
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Analytics Tabs */}
      <Tabs defaultValue="engagement" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="revenue">Revenus</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="scalability">Scalabilité</TabsTrigger>
          <TabsTrigger value="realtime">Temps Réel</TabsTrigger>
        </TabsList>

        <TabsContent value="engagement" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Utilisateur</CardTitle>
                <CardDescription>
                  Tendances d'engagement sur les 30 derniers jours
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserEngagementChart data={analyticsData?.engagementData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métriques Comportementales</CardTitle>
                <CardDescription>
                  Analyse du comportement des utilisateurs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Temps de session moyen</span>
                    <span className="font-medium">{analyticsData?.avgSessionTime || '0m'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Taux de rebond</span>
                    <span className="font-medium">{analyticsData?.bounceRate || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pages par session</span>
                    <span className="font-medium">{analyticsData?.pagesPerSession || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <RevenueAnalytics data={businessMetrics} />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <PerformanceMetricsChart />
        </TabsContent>

        <TabsContent value="scalability" className="space-y-4">
          <ScalabilityMonitor />
        </TabsContent>

        <TabsContent value="realtime" className="space-y-4">
          <RealTimeMetrics />
        </TabsContent>
      </Tabs>
    </div>
  );
};