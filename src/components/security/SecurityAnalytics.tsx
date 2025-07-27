import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Download,
  Filter,
  RefreshCw,
  AlertTriangle,
  Shield,
  Zap,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SecurityMetric {
  date: string;
  threats: number;
  blocked: number;
  analyzed: number;
  falsePositives: number;
}

interface ThreatCategory {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export const SecurityAnalytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedMetric, setSelectedMetric] = useState('threats');
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetric[]>([]);
  const [threatCategories, setThreatCategories] = useState<ThreatCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadSecurityAnalytics();
  }, [timeRange]);

  const loadSecurityAnalytics = async () => {
    setIsLoading(true);
    try {
      // Simulation de données d'analytiques
      const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
      const mockMetrics: SecurityMetric[] = [];
      
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        
        mockMetrics.push({
          date: date.toISOString().split('T')[0],
          threats: Math.floor(Math.random() * 50) + 10,
          blocked: Math.floor(Math.random() * 40) + 5,
          analyzed: Math.floor(Math.random() * 200) + 100,
          falsePositives: Math.floor(Math.random() * 5) + 1,
        });
      }
      
      setSecurityMetrics(mockMetrics);

      // Données des catégories de menaces
      const mockCategories: ThreatCategory[] = [
        { name: 'Brute Force', count: 45, percentage: 35, color: '#ef4444' },
        { name: 'SQL Injection', count: 32, percentage: 25, color: '#f97316' },
        { name: 'XSS', count: 25, percentage: 20, color: '#eab308' },
        { name: 'CSRF', count: 15, percentage: 12, color: '#22c55e' },
        { name: 'Autres', count: 10, percentage: 8, color: '#6366f1' },
      ];
      
      setThreatCategories(mockCategories);
    } catch (error) {
      console.error('Erreur lors du chargement des analytiques:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTotalThreats = () => securityMetrics.reduce((acc, metric) => acc + metric.threats, 0);
  const getTotalBlocked = () => securityMetrics.reduce((acc, metric) => acc + metric.blocked, 0);
  const getBlockingRate = () => {
    const total = getTotalThreats();
    const blocked = getTotalBlocked();
    return total > 0 ? Math.round((blocked / total) * 100) : 0;
  };

  const getAverageAnalyzed = () => {
    return securityMetrics.length > 0 
      ? Math.round(securityMetrics.reduce((acc, metric) => acc + metric.analyzed, 0) / securityMetrics.length)
      : 0;
  };

  const getTrend = () => {
    if (securityMetrics.length < 2) return 'stable';
    
    const recent = securityMetrics.slice(-3).reduce((acc, metric) => acc + metric.threats, 0);
    const previous = securityMetrics.slice(-6, -3).reduce((acc, metric) => acc + metric.threats, 0);
    
    if (recent > previous * 1.1) return 'up';
    if (recent < previous * 0.9) return 'down';
    return 'stable';
  };

  const exportData = () => {
    const data = {
      metrics: securityMetrics,
      categories: threatCategories,
      summary: {
        totalThreats: getTotalThreats(),
        totalBlocked: getTotalBlocked(),
        blockingRate: getBlockingRate(),
        averageAnalyzed: getAverageAnalyzed()
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-analytics-${timeRange}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const trend = getTrend();

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Analytiques de Sécurité</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">7 jours</SelectItem>
                  <SelectItem value="30d">30 jours</SelectItem>
                  <SelectItem value="90d">90 jours</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={loadSecurityAnalytics} disabled={isLoading} variant="outline" size="sm">
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              </Button>
              <Button onClick={exportData} variant="outline" size="sm">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menaces Totales</CardTitle>
            <div className="flex items-center space-x-1">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              {trend === 'up' && <TrendingUp className="h-3 w-3 text-red-500" />}
              {trend === 'down' && <TrendingDown className="h-3 w-3 text-green-500" />}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalThreats()}</div>
            <p className="text-xs text-muted-foreground">
              {timeRange === '7d' ? 'Cette semaine' : timeRange === '30d' ? 'Ce mois' : 'Ces 3 mois'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bloquées</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalBlocked()}</div>
            <p className="text-xs text-muted-foreground">
              Taux: {getBlockingRate()}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analyses/Jour</CardTitle>
            <Target className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getAverageAnalyzed()}</div>
            <p className="text-xs text-muted-foreground">
              Moyenne quotidienne
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Efficacité</CardTitle>
            <Zap className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getBlockingRate()}%</div>
            <p className="text-xs text-muted-foreground">
              Taux de détection
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="distribution">Distribution</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Évolution des Menaces dans le Temps</CardTitle>
              <CardDescription>
                Tendances des détections et blocages sur la période sélectionnée
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={securityMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString('fr-FR')}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="threats" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    name="Menaces détectées"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="blocked" 
                    stroke="#22c55e" 
                    strokeWidth={2}
                    name="Menaces bloquées"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="analyzed" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Requêtes analysées"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Répartition par Type de Menace</CardTitle>
                <CardDescription>
                  Distribution des différents types d'attaques détectées
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={threatCategories}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="count"
                    >
                      {threatCategories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Détails par Catégorie</CardTitle>
                <CardDescription>
                  Statistiques détaillées des types de menaces
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {threatCategories.map((category) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded" 
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{category.count}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {category.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance de Détection</CardTitle>
              <CardDescription>
                Analyse des performances du système de détection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={securityMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => new Date(date).toLocaleDateString('fr-FR')}
                  />
                  <Legend />
                  <Bar 
                    dataKey="threats" 
                    fill="#ef4444" 
                    name="Menaces"
                  />
                  <Bar 
                    dataKey="blocked" 
                    fill="#22c55e" 
                    name="Bloquées"
                  />
                  <Bar 
                    dataKey="falsePositives" 
                    fill="#f97316" 
                    name="Faux positifs"
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};