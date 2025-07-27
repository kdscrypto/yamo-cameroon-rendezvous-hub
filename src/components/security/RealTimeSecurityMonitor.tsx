import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { AlertTriangle, Shield, Activity, Eye, Clock, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SecurityAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: number;
  data?: any;
}

interface SecurityMetrics {
  totalEvents: number;
  criticalEvents: number;
  rateLimitViolations: number;
  blockedIPs: string[];
  recentThreats: Array<{
    type: string;
    severity: string;
    timestamp: number;
    source: string;
  }>;
}

export const RealTimeSecurityMonitor = () => {
  const { 
    metrics, 
    alerts, 
    isMonitoring, 
    securityLevel, 
    dismissAlert,
    updateMetrics 
  } = useSecurityMonitoring();

  const [isExpanded, setIsExpanded] = useState(false);

  const getSecurityLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-destructive';
      case 'high': return 'text-orange-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-muted-foreground';
    }
  };

  const getSecurityLevelIcon = (level: string) => {
    switch (level) {
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Shield className="h-4 w-4" />;
      case 'low': return <Shield className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const formatRelativeTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `Il y a ${minutes}m`;
    if (hours < 24) return `Il y a ${hours}h`;
    return `Il y a ${Math.floor(hours / 24)}j`;
  };

  return (
    <div className="space-y-4">
      {/* Security Status Card */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className={cn("flex items-center space-x-1", getSecurityLevelColor(securityLevel))}>
                {getSecurityLevelIcon(securityLevel)}
                <CardTitle className="text-lg">Statut de sécurité</CardTitle>
              </div>
              <Badge variant={securityLevel === 'low' ? 'default' : 'destructive'}>
                {securityLevel.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center space-x-2">
              <div className={cn("w-2 h-2 rounded-full", isMonitoring ? "bg-green-500" : "bg-red-500")} />
              <span className="text-sm text-muted-foreground">
                {isMonitoring ? 'Actif' : 'Inactif'}
              </span>
            </div>
          </div>
          <CardDescription>
            Surveillance en temps réel des événements de sécurité
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Événements totaux</p>
              <p className="text-2xl font-bold">{metrics.totalEvents}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Événements critiques</p>
              <p className="text-2xl font-bold text-destructive">{metrics.criticalEvents}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Violations rate limit</p>
              <p className="text-2xl font-bold text-orange-500">{metrics.rateLimitViolations}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">IPs bloquées</p>
              <p className="text-2xl font-bold text-red-500">{metrics.blockedIPs.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <span>Alertes actives ({alerts.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.slice(0, isExpanded ? alerts.length : 3).map((alert) => (
              <Alert 
                key={alert.id} 
                variant={alert.type === 'critical' ? 'destructive' : 'default'}
                className="relative"
              >
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle className="flex items-center justify-between">
                  <span>{alert.type.toUpperCase()}</span>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(alert.timestamp)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissAlert(alert.id)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </AlertTitle>
                <AlertDescription>{alert.message}</AlertDescription>
              </Alert>
            ))}
            {alerts.length > 3 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full"
              >
                {isExpanded ? 'Voir moins' : `Voir ${alerts.length - 3} alertes de plus`}
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Threats */}
      {metrics.recentThreats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Menaces récentes</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.recentThreats.slice(0, 5).map((threat, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Badge variant={threat.severity === 'critical' ? 'destructive' : 'secondary'}>
                      {threat.severity}
                    </Badge>
                    <div>
                      <p className="font-medium">{threat.type}</p>
                      <p className="text-sm text-muted-foreground">Source: {threat.source}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{formatTimestamp(threat.timestamp)}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Contrôles de surveillance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Button 
              onClick={updateMetrics}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Activity className="h-4 w-4" />
              <span>Actualiser les métriques</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};