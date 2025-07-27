import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useScalabilityMonitoring } from '@/hooks/useScalabilityMonitoring';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Server, Database, Cpu, HardDrive, Wifi, AlertTriangle, CheckCircle, Activity } from 'lucide-react';

export const ScalabilityMonitor = () => {
  const { 
    resourceMetrics, 
    capacityPrediction, 
    bottlenecks, 
    scalabilityScore,
    alerts,
    isLoading 
  } = useScalabilityMonitoring();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-32"></div>
            </CardHeader>
            <CardContent>
              <div className="h-32 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getStatusColor = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return 'text-red-600';
    if (value >= thresholds.warning) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStatusIcon = (value: number, thresholds: { warning: number; critical: number }) => {
    if (value >= thresholds.critical) return AlertTriangle;
    if (value >= thresholds.warning) return Activity;
    return CheckCircle;
  };

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {alerts && alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <Alert key={index} variant={alert.severity === 'critical' ? 'destructive' : 'default'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{alert.component}:</strong> {alert.message}
                {alert.recommendation && (
                  <div className="mt-1 text-sm opacity-80">
                    Recommandation: {alert.recommendation}
                  </div>
                )}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Scalability Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Score de Scalabilité
            <Badge variant={scalabilityScore >= 80 ? "default" : scalabilityScore >= 60 ? "secondary" : "destructive"}>
              {scalabilityScore}/100
            </Badge>
          </CardTitle>
          <CardDescription>
            Évaluation globale de la capacité de mise à l'échelle
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={scalabilityScore} className="mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium">Infrastructure</div>
              <div className="text-muted-foreground">
                {resourceMetrics?.infrastructure?.status || 'N/A'}
              </div>
            </div>
            <div className="text-center">
              <div className="font-medium">Base de données</div>
              <div className="text-muted-foreground">
                {resourceMetrics?.database?.status || 'N/A'}
              </div>
            </div>
            <div className="text-center">
              <div className="font-medium">Application</div>
              <div className="text-muted-foreground">
                {resourceMetrics?.application?.status || 'N/A'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resource Utilization */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Cpu className="h-4 w-4 mr-2" />
              CPU
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resourceMetrics?.cpu?.usage.toFixed(1)}%
            </div>
            <Progress value={resourceMetrics?.cpu?.usage} className="mt-2" />
            <div className="flex items-center mt-1">
              {(() => {
                const CpuIcon = getStatusIcon(resourceMetrics?.cpu?.usage || 0, { warning: 70, critical: 90 });
                return (
                  <>
                    <CpuIcon className={`h-3 w-3 mr-1 ${getStatusColor(resourceMetrics?.cpu?.usage || 0, { warning: 70, critical: 90 })}`} />
                    <span className="text-xs text-muted-foreground">
                      {resourceMetrics?.cpu?.cores} cores
                    </span>
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <HardDrive className="h-4 w-4 mr-2" />
              Mémoire
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resourceMetrics?.memory?.usage.toFixed(1)}%
            </div>
            <Progress value={resourceMetrics?.memory?.usage} className="mt-2" />
            <div className="flex items-center mt-1">
              {(() => {
                const MemoryIcon = getStatusIcon(resourceMetrics?.memory?.usage || 0, { warning: 80, critical: 95 });
                return (
                  <>
                    <MemoryIcon className={`h-3 w-3 mr-1 ${getStatusColor(resourceMetrics?.memory?.usage || 0, { warning: 80, critical: 95 })}`} />
                    <span className="text-xs text-muted-foreground">
                      {resourceMetrics?.memory?.total}GB total
                    </span>
                  </>
                );
              })()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Database className="h-4 w-4 mr-2" />
              Base de données
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resourceMetrics?.database?.connections || 0}
            </div>
            <div className="text-xs text-muted-foreground">Connexions actives</div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Requêtes/sec</span>
                <span>{resourceMetrics?.database?.qps || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Latence moy.</span>
                <span>{resourceMetrics?.database?.latency || 0}ms</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Wifi className="h-4 w-4 mr-2" />
              Réseau
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {resourceMetrics?.network?.bandwidth.toFixed(1)}MB/s
            </div>
            <div className="text-xs text-muted-foreground">Bande passante</div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span>Latence</span>
                <span>{resourceMetrics?.network?.latency}ms</span>
              </div>
              <div className="flex justify-between text-xs">
                <span>Paquets perdus</span>
                <span>{resourceMetrics?.network?.packetLoss}%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Capacity Prediction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Prédiction de Capacité</CardTitle>
            <CardDescription>
              Projection de l'utilisation des ressources
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={capacityPrediction}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="period" 
                    className="text-xs"
                  />
                  <YAxis className="text-xs" />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `${value.toFixed(1)}%`,
                      name === 'predicted' ? 'Prédit' : name === 'current' ? 'Actuel' : 'Capacité Max'
                    ]}
                  />
                  <Area
                    type="monotone"
                    dataKey="current"
                    stackId="1"
                    stroke="hsl(var(--primary))"
                    fill="hsl(var(--primary) / 0.3)"
                    name="current"
                  />
                  <Area
                    type="monotone"
                    dataKey="predicted"
                    stackId="1"
                    stroke="hsl(var(--accent))"
                    fill="hsl(var(--accent) / 0.3)"
                    name="predicted"
                  />
                  <Line
                    type="monotone"
                    dataKey="capacity"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="capacity"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Goulots d'Étranglement</CardTitle>
            <CardDescription>
              Identification des contraintes de performance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {bottlenecks && bottlenecks.length > 0 ? (
                bottlenecks.map((bottleneck, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="font-medium">{bottleneck.component}</div>
                      <Badge variant={bottleneck.severity === 'critical' ? 'destructive' : 'secondary'}>
                        {bottleneck.severity}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {bottleneck.description}
                    </div>
                    <div className="text-sm">
                      <strong>Impact:</strong> {bottleneck.impact}
                    </div>
                    {bottleneck.suggestions && (
                      <div className="mt-2 text-sm">
                        <strong>Suggestions:</strong>
                        <ul className="list-disc list-inside ml-2 text-muted-foreground">
                          {bottleneck.suggestions.map((suggestion, i) => (
                            <li key={i}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <p>Aucun goulot d'étranglement détecté</p>
                  <p className="text-sm">Votre système fonctionne de manière optimale</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};