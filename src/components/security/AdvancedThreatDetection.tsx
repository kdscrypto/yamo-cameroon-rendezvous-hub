import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAdvancedThreatDetection } from '@/hooks/useAdvancedThreatDetection';
import { 
  Brain, 
  Zap, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  Shield,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ThreatDetection {
  id: string;
  type: 'behavioral' | 'pattern' | 'anomaly' | 'ml_model';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  confidence: number;
  timestamp: Date;
  source: string;
  details: any;
}

export const AdvancedThreatDetection = () => {
  const { 
    isAnalyzing, 
    threatLevel, 
    detectionStats, 
    getRecentDetections,
    analyzePattern,
    runBehavioralAnalysis 
  } = useAdvancedThreatDetection();
  
  const [recentDetections, setRecentDetections] = useState<ThreatDetection[]>([]);
  const [isRunningAnalysis, setIsRunningAnalysis] = useState(false);

  useEffect(() => {
    const loadRecentDetections = async () => {
      const detections = await getRecentDetections();
      setRecentDetections(detections);
    };
    
    loadRecentDetections();
    
    // Refresh every 30 seconds
    const interval = setInterval(loadRecentDetections, 30000);
    return () => clearInterval(interval);
  }, [getRecentDetections]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-500';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'behavioral': return Activity;
      case 'pattern': return Target;
      case 'anomaly': return AlertTriangle;
      case 'ml_model': return Brain;
      default: return Shield;
    }
  };

  const handleManualAnalysis = async () => {
    setIsRunningAnalysis(true);
    try {
      await runBehavioralAnalysis();
      // Refresh detections after analysis
      const newDetections = await getRecentDetections();
      setRecentDetections(newDetections);
    } catch (error) {
      console.error('Erreur lors de l\'analyse:', error);
    } finally {
      setIsRunningAnalysis(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analyse IA</CardTitle>
            <Brain className={cn("h-4 w-4", isAnalyzing ? "text-blue-500 animate-pulse" : "text-gray-500")} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isAnalyzing ? 'Active' : 'Inactive'}
            </div>
            <p className="text-xs text-muted-foreground">
              Intelligence artificielle
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Détections</CardTitle>
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
            <CardTitle className="text-sm font-medium">Précision</CardTitle>
            <Target className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {detectionStats.accuracy || 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Taux de précision
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Modèles</CardTitle>
            <Brain className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {detectionStats.activeModels || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Modèles actifs
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analysis Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Contrôles d'Analyse IA</span>
          </CardTitle>
          <CardDescription>
            Lancez des analyses spécialisées pour détecter les menaces avancées
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={handleManualAnalysis}
              disabled={isRunningAnalysis}
              variant="outline"
              className="h-20 flex-col space-y-2"
            >
              <Activity className="h-6 w-6" />
              <span>Analyse Comportementale</span>
            </Button>
            
            <Button 
              onClick={() => analyzePattern('network')}
              disabled={isRunningAnalysis}
              variant="outline"
              className="h-20 flex-col space-y-2"
            >
              <Target className="h-6 w-6" />
              <span>Détection de Motifs</span>
            </Button>
            
            <Button 
              onClick={() => analyzePattern('anomaly')}
              disabled={isRunningAnalysis}
              variant="outline"
              className="h-20 flex-col space-y-2"
            >
              <AlertTriangle className="h-6 w-6" />
              <span>Anomalies ML</span>
            </Button>
          </div>
          
          {isRunningAnalysis && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Analyse en cours...</span>
                <span>Processing</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Detections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Détections Récentes</span>
          </CardTitle>
          <CardDescription>
            Menaces détectées par l'IA et l'analyse comportementale
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {recentDetections.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucune menace détectée récemment</p>
                  <p className="text-sm">Tous les systèmes fonctionnent normalement</p>
                </div>
              ) : (
                recentDetections.map((detection) => {
                  const IconComponent = getTypeIcon(detection.type);
                  
                  return (
                    <Alert key={detection.id} className="border-l-4" style={{
                      borderLeftColor: detection.severity === 'critical' ? 'rgb(239 68 68)' :
                                     detection.severity === 'high' ? 'rgb(249 115 22)' :
                                     detection.severity === 'medium' ? 'rgb(234 179 8)' : 'rgb(34 197 94)'
                    }}>
                      <div className="flex items-start space-x-3">
                        <IconComponent className={cn("h-5 w-5 mt-0.5", getSeverityColor(detection.severity))} />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge variant={getSeverityBadge(detection.severity)}>
                                {detection.severity.toUpperCase()}
                              </Badge>
                              <Badge variant="outline">
                                {detection.type}
                              </Badge>
                              <span className="text-sm text-muted-foreground">
                                Confiance: {detection.confidence}%
                              </span>
                            </div>
                            <div className="flex items-center text-sm text-muted-foreground">
                              <Clock className="h-4 w-4 mr-1" />
                              {detection.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                          <AlertDescription>
                            <strong>{detection.source}:</strong> {detection.description}
                          </AlertDescription>
                        </div>
                      </div>
                    </Alert>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* ML Models Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5" />
            <span>Modèles d'Intelligence Artificielle</span>
          </CardTitle>
          <CardDescription>
            État et performances des modèles de détection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Analyse Comportementale</span>
                <Badge variant="default">Actif</Badge>
              </div>
              <Progress value={92} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Précision: 92%</span>
                <span>Dernière mise à jour: 2h</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Détection d'Anomalies</span>
                <Badge variant="default">Actif</Badge>
              </div>
              <Progress value={89} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Précision: 89%</span>
                <span>Dernière mise à jour: 1h</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Analyse de Motifs</span>
                <Badge variant="default">Actif</Badge>
              </div>
              <Progress value={95} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Précision: 95%</span>
                <span>Dernière mise à jour: 30min</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Prédiction de Menaces</span>
                <Badge variant="secondary">Entraînement</Badge>
              </div>
              <Progress value={67} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Précision: 67%</span>
                <span>ETA: 4h</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};