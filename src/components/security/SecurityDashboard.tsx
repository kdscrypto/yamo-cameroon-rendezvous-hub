import React, { useState, useEffect } from 'react';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Shield, AlertTriangle, Activity, Clock, Users, Lock } from 'lucide-react';

const SecurityDashboard: React.FC = () => {
  const {
    metrics,
    alerts,
    isMonitoring,
    securityLevel,
    dismissAlert,
    updateMetrics,
    startMonitoring
  } = useSecurityMonitoring();

  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    if (!isMonitoring) {
      startMonitoring();
    }
    
    const interval = setInterval(() => {
      updateMetrics();
      setLastUpdate(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [isMonitoring, startMonitoring, updateMetrics]);

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
      case 'critical': return <AlertTriangle className="h-4 w-4" />;
      case 'high': return <AlertTriangle className="h-4 w-4" />;
      case 'medium': return <Shield className="h-4 w-4" />;
      case 'low': return <Shield className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Security Level Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Status
          </CardTitle>
          <CardDescription>
            Current security monitoring status and threat level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant={getSecurityLevelColor(securityLevel)}>
                {getSecurityLevelIcon(securityLevel)}
                {securityLevel.toUpperCase()}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Monitoring: {isMonitoring ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">
              Last updated: {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              Security events logged
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{metrics.criticalEvents}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rate Limit Violations</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.rateLimitViolations}</div>
            <p className="text-xs text-muted-foreground">
              Active rate limited IPs
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.blockedIPs.length}</div>
            <p className="text-xs text-muted-foreground">
              Currently blocked addresses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Active Security Alerts
            </CardTitle>
            <CardDescription>
              Recent security alerts that require attention
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.slice(0, 5).map((alert) => (
              <Alert key={alert.id} variant={alert.type === 'critical' ? 'destructive' : 'default'}>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>
                  {alert.type.toUpperCase()} - {alert.message}
                </AlertTitle>
                <AlertDescription className="flex items-center justify-between">
                  <span>
                    {new Date(alert.timestamp).toLocaleString()}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => dismissAlert(alert.id)}
                  >
                    Dismiss
                  </Button>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Recent Threats */}
      {metrics.recentThreats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Recent Security Threats
            </CardTitle>
            <CardDescription>
              Latest detected security threats and incidents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.recentThreats.slice(0, 10).map((threat, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={threat.severity === 'critical' ? 'destructive' : 'secondary'}>
                      {threat.type}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      from {threat.source}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(threat.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Blocked IPs */}
      {metrics.blockedIPs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Blocked IP Addresses
            </CardTitle>
            <CardDescription>
              Currently blocked IP addresses and sources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {metrics.blockedIPs.slice(0, 12).map((ip, index) => (
                <div key={index} className="p-2 bg-muted rounded text-sm font-mono">
                  {ip}
                </div>
              ))}
              {metrics.blockedIPs.length > 12 && (
                <div className="p-2 bg-muted rounded text-sm text-muted-foreground">
                  +{metrics.blockedIPs.length - 12} more...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SecurityDashboard;