// Composant de métriques en temps réel
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Activity, Users, Clock, X } from 'lucide-react';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { useCacheMetrics } from '@/utils/performanceCache';

const RealTimeMetrics = () => {
  const { metrics, alerts, securityLevel, dismissAlert, isMonitoring } = useSecurityMonitoring();
  const cacheMetrics = useCacheMetrics();
  const [showAllAlerts, setShowAllAlerts] = useState(false);

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getSecurityLevelIcon = (level: string) => {
    switch (level) {
      case 'critical':
      case 'high':
        return <AlertTriangle className="h-4 w-4" />;
      case 'medium':
        return <Activity className="h-4 w-4" />;
      case 'low':
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const visibleAlerts = showAllAlerts ? alerts : alerts.slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Status général */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Monitoring en temps réel
            <Badge variant={isMonitoring ? 'default' : 'secondary'}>
              {isMonitoring ? 'Actif' : 'Inactif'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Surveillance de la sécurité et des performances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {getSecurityLevelIcon(securityLevel)}
              <span className="font-medium">Niveau de sécurité:</span>
              <Badge variant={getSecurityLevelColor(securityLevel)}>
                {securityLevel.toUpperCase()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métriques de sécurité */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Événements totaux</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.criticalEvents} critiques
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rate Limiting</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.rateLimitViolations}</div>
            <p className="text-xs text-muted-foreground">
              Violations actives
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">IPs bloquées</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.blockedIPs.length}</div>
            <p className="text-xs text-muted-foreground">
              Adresses suspectes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cache</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cacheMetrics.hitRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Taux de succès
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertes de sécurité */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Alertes de sécurité
                <Badge variant="destructive">{alerts.length}</Badge>
              </CardTitle>
              {alerts.length > 3 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAllAlerts(!showAllAlerts)}
                >
                  {showAllAlerts ? 'Voir moins' : 'Voir tout'}
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {visibleAlerts.map((alert) => (
              <Alert key={alert.id} variant={alert.type === 'critical' ? 'destructive' : 'default'}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <AlertDescription className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{alert.message}</span>
                      <Badge variant="outline" className="text-xs">
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </Badge>
                    </AlertDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissAlert(alert.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Menaces récentes */}
      {metrics.recentThreats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Menaces récentes</CardTitle>
            <CardDescription>
              Dernières tentatives d'attaque détectées
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {metrics.recentThreats.slice(0, 5).map((threat, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded border">
                  <div className="flex items-center gap-2">
                    <Badge variant={threat.severity === 'critical' ? 'destructive' : 'default'}>
                      {threat.type}
                    </Badge>
                    <span className="text-sm">{threat.source}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(threat.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* IPs bloquées */}
      {metrics.blockedIPs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Adresses IP bloquées
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {metrics.blockedIPs.slice(0, 10).map((ip, index) => (
                <div key={index} className="p-2 bg-muted rounded font-mono text-sm">
                  {ip}
                </div>
              ))}
              {metrics.blockedIPs.length > 10 && (
                <div className="p-2 text-center text-muted-foreground text-sm">
                  +{metrics.blockedIPs.length - 10} autres...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RealTimeMetrics;