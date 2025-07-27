import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface BusinessMetrics {
  revenue: number;
  revenueGrowth: number;
  arpu: number;
  ltv: number;
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

interface RevenueAnalyticsProps {
  data?: BusinessMetrics;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export const RevenueAnalytics = ({ data }: RevenueAnalyticsProps) => {
  if (!data) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-32"></div>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Key Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">ARPU</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{data.arpu.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Revenu par utilisateur</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">LTV</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{data.ltv.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Valeur vie client</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.churnRate}%</div>
            <p className="text-xs text-muted-foreground">Taux d'abandon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Marge</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.profitMargin}%</div>
            <p className="text-xs text-muted-foreground">Marge bénéficiaire</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Forecast */}
        <Card>
          <CardHeader>
            <CardTitle>Prévisions de Revenus</CardTitle>
            <CardDescription>
              Projection sur 12 mois avec données historiques
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.forecastData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    formatter={(value: number, name: string) => [
                      `€${value.toLocaleString()}`,
                      name === 'projected' ? 'Projeté' : 'Réel'
                    ]}
                  />
                  <Line
                    type="monotone"
                    dataKey="actual"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Réel"
                    connectNulls={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="projected"
                    stroke="hsl(var(--muted-foreground))"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="Projeté"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Segment */}
        <Card>
          <CardHeader>
            <CardTitle>Revenus par Segment</CardTitle>
            <CardDescription>
              Répartition des sources de revenus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center">
              <div className="w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.revenueBySegment}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      dataKey="percentage"
                      startAngle={90}
                      endAngle={450}
                    >
                      {data.revenueBySegment.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) => [`${value}%`, 'Pourcentage']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-1/2 space-y-2">
                {data.revenueBySegment.map((segment, index) => (
                  <div key={segment.segment} className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{segment.segment}</div>
                      <div className="text-xs text-muted-foreground">
                        €{segment.revenue.toLocaleString()} ({segment.percentage}%)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Drivers */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Facteurs Clés de Performance</CardTitle>
            <CardDescription>
              Métriques ayant le plus d'impact sur les revenus
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {data.keyDrivers.map((driver, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getTrendIcon(driver.trend)}
                    <div>
                      <div className="font-medium">{driver.metric}</div>
                      <div className="text-sm text-muted-foreground">
                        Impact: {driver.impact > 0 ? '+' : ''}{driver.impact}%
                      </div>
                    </div>
                  </div>
                  <Badge variant={driver.impact > 0 ? 'default' : 'destructive'}>
                    {driver.trend}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};