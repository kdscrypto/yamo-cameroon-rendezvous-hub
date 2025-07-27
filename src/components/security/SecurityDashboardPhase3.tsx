import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RealTimeSecurityMonitor } from './RealTimeSecurityMonitor';
import { SecurityAlertsSystem } from './SecurityAlertsSystem';
import { useRealTimeSecurityAlerts } from '@/hooks/useRealTimeSecurityAlerts';
import { useModerationRights } from '@/hooks/useModerationRights';
import { 
  Shield, 
  Activity, 
  Bell, 
  TrendingUp, 
  Eye,
  AlertTriangle,
  CheckCircle,
  Settings,
  BarChart3,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const SecurityDashboardPhase3 = () => {
  const { hasModerationRights, loading } = useModerationRights();
  const { isListening, getAlertStats, triggerTestAlert } = useRealTimeSecurityAlerts();
  const [alertStats, setAlertStats] = useState<any>(null);

  useEffect(() => {
    if (!loading) {
      setAlertStats(getAlertStats());
    }
  }, [loading, getAlertStats]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasModerationRights) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Accès refusé</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Vous n'avez pas les droits nécessaires pour accéder au tableau de bord de sécurité.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord de sécurité</h1>
          <p className="text-muted-foreground">
            Surveillance et alertes en temps réel - Phase 3
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isListening ? 'default' : 'destructive'}>
            {isListening ? 'Surveillance active' : 'Surveillance inactive'}
          </Badge>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Surveillance</CardTitle>
            <Activity className={cn("h-4 w-4", isListening ? "text-green-500" : "text-red-500")} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isListening ? 'Active' : 'Inactive'}
            </div>
            <p className="text-xs text-muted-foreground">
              Monitoring en temps réel
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Règles actives</CardTitle>
            <Bell className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alertStats?.activeRules || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              sur {alertStats?.totalRules || 0} règles configurées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifications</CardTitle>
            {alertStats?.hasNotificationPermission ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alertStats?.hasNotificationPermission ? 'Activées' : 'Désactivées'}
            </div>
            <p className="text-xs text-muted-foreground">
              Notifications navigateur
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phase</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Phase 3</div>
            <p className="text-xs text-muted-foreground">
              Surveillance temps réel
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="monitor" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="monitor" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Surveillance</span>
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center space-x-2">
            <Bell className="h-4 w-4" />
            <span>Alertes</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Analytiques</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Configuration</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="monitor" className="space-y-4">
          <RealTimeSecurityMonitor />
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <SecurityAlertsSystem />
          <Card>
            <CardHeader>
              <CardTitle>Test du système</CardTitle>
              <CardDescription>
                Testez le fonctionnement des alertes et notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={triggerTestAlert} variant="outline">
                Déclencher une alerte test
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5" />
                <span>Analytiques de sécurité</span>
              </CardTitle>
              <CardDescription>
                Statistiques et tendances des événements de sécurité
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Analytiques avancées disponibles en Phase 4</p>
                <p className="text-sm">Graphiques, tendances et rapports détaillés</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Configuration avancée</span>
              </CardTitle>
              <CardDescription>
                Paramètres avancés de surveillance et d'alertes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Configuration avancée disponible en Phase 4</p>
                  <p className="text-sm">Règles personnalisées, intégrations externes, etc.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer Info */}
      <Card className="border-l-4 border-l-green-500">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="font-medium">Phase 3 active</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Surveillance en temps réel et système d'alertes opérationnels. 
            Phase 4 (Détection avancée) et Phase 5 (Analytiques) à venir.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};