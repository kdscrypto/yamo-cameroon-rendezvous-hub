import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RealTimeSecurityMonitor } from './RealTimeSecurityMonitor';
import { SecurityAlertsSystem } from './SecurityAlertsSystem';
import { AdvancedThreatDetection } from './AdvancedThreatDetection';
import { SecurityAnalytics } from './SecurityAnalytics';
import { ThreatIntelligence } from './ThreatIntelligence';
import { useRealTimeSecurityAlerts } from '@/hooks/useRealTimeSecurityAlerts';
import { useModerationRights } from '@/hooks/useModerationRights';
import { useAdvancedThreatDetection } from '@/hooks/useAdvancedThreatDetection';
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
  Brain,
  Zap,
  Target,
  Radar,
  Lock
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const SecurityDashboardPhase4 = () => {
  const { hasModerationRights, loading } = useModerationRights();
  const { isListening, getAlertStats, triggerTestAlert } = useRealTimeSecurityAlerts();
  const { 
    threatLevel, 
    activeThreatDetectors, 
    detectionStats, 
    isAnalyzing,
    startAdvancedDetection,
    stopAdvancedDetection 
  } = useAdvancedThreatDetection();
  
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

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getThreatLevelBadge = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Détection Avancée des Menaces</h1>
          <p className="text-muted-foreground">
            Intelligence artificielle et analyse comportementale - Phase 4
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant={isListening ? 'default' : 'destructive'}>
            {isListening ? 'Surveillance active' : 'Surveillance inactive'}
          </Badge>
          <Badge variant={getThreatLevelBadge(threatLevel)}>
            Niveau: {threatLevel.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Threat Level Alert */}
      {threatLevel === 'critical' || threatLevel === 'high' && (
        <Alert className="border-destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Alerte de sécurité:</strong> Niveau de menace élevé détecté. 
            Surveillance renforcée activée automatiquement.
          </AlertDescription>
        </Alert>
      )}

      {/* Advanced Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Niveau de Menace</CardTitle>
            <Target className={cn("h-4 w-4", getThreatLevelColor(threatLevel))} />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", getThreatLevelColor(threatLevel))}>
              {threatLevel.toUpperCase()}
            </div>
            <p className="text-xs text-muted-foreground">
              Analyse en temps réel
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Détecteurs IA</CardTitle>
            <Brain className={cn("h-4 w-4", isAnalyzing ? "text-blue-500 animate-pulse" : "text-gray-500")} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeThreatDetectors}
            </div>
            <p className="text-xs text-muted-foreground">
              Détecteurs actifs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analyses</CardTitle>
            <Radar className={cn("h-4 w-4", isAnalyzing ? "text-green-500" : "text-gray-500")} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {detectionStats.totalAnalyses || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Analyses effectuées
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menaces Détectées</CardTitle>
            <Zap className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {detectionStats.threatsDetected || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Dernières 24h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Phase</CardTitle>
            <Lock className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Phase 4</div>
            <p className="text-xs text-muted-foreground">
              Détection avancée
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Contrôle de la Détection Avancée</span>
          </CardTitle>
          <CardDescription>
            Gérez les systèmes de détection automatique et l'intelligence artificielle
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Button 
              onClick={isAnalyzing ? stopAdvancedDetection : startAdvancedDetection}
              variant={isAnalyzing ? "destructive" : "default"}
              size="sm"
            >
              {isAnalyzing ? "Arrêter" : "Démarrer"} l'Analyse IA
            </Button>
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span>Capacité d'analyse</span>
                <span>{detectionStats.analysisCapacity || 0}%</span>
              </div>
              <Progress value={detectionStats.analysisCapacity || 0} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="detection" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="detection" className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>Détection IA</span>
          </TabsTrigger>
          <TabsTrigger value="intelligence" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Intelligence</span>
          </TabsTrigger>
          <TabsTrigger value="monitor" className="flex items-center space-x-2">
            <Eye className="h-4 w-4" />
            <span>Surveillance</span>
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

        <TabsContent value="detection" className="space-y-4">
          <AdvancedThreatDetection />
        </TabsContent>

        <TabsContent value="intelligence" className="space-y-4">
          <ThreatIntelligence />
        </TabsContent>

        <TabsContent value="monitor" className="space-y-4">
          <RealTimeSecurityMonitor />
          <SecurityAlertsSystem />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <SecurityAnalytics />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>Configuration Avancée IA</span>
              </CardTitle>
              <CardDescription>
                Paramètres des modèles d'IA et seuils de détection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-muted-foreground">
                  <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Configuration IA disponible</p>
                  <p className="text-sm">Paramétrage des modèles, seuils et règles personnalisées</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Footer Info */}
      <Card className="border-l-4 border-l-purple-500">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-500" />
            <span className="font-medium">Phase 4 - Détection Avancée Active</span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Intelligence artificielle et analyse comportementale opérationnelles. 
            Détection proactive des menaces et analyse prédictive en cours.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};