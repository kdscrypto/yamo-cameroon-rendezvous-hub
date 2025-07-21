import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, Eye, MousePointer, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AnalyticsSummary {
  metric_type: string;
  total_count: number;
  unique_sessions: number;
  date_breakdown: any; // JSONB from database
}

export const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - parseInt(timeRange));
      
      const { data, error } = await supabase.rpc('get_analytics_summary', {
        p_start_date: startDate.toISOString().split('T')[0],
        p_end_date: new Date().toISOString().split('T')[0]
      });

      if (error) {
        console.error('Error fetching analytics:', error);
      } else {
        setAnalytics(data || []);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [timeRange]);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user, fetchAnalytics]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 30000);

    return () => clearInterval(interval);
  }, [user, fetchAnalytics]);


  const getMetricIcon = (type: string) => {
    switch (type) {
      case 'page_view': return <Eye className="w-4 h-4" />;
      case 'user_session': return <Users className="w-4 h-4" />;
      case 'ad_interaction': return <MousePointer className="w-4 h-4" />;
      default: return <TrendingUp className="w-4 h-4" />;
    }
  };

  const prepareChartData = (dateBreakdown: any) => {
    if (!dateBreakdown || typeof dateBreakdown !== 'object') return [];
    return Object.entries(dateBreakdown).map(([date, count]) => ({
      date,
      count: Number(count)
    })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-20 bg-muted"></CardHeader>
            <CardContent className="h-16 bg-muted/50"></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalPageViews = analytics.find(a => a.metric_type === 'page_view')?.total_count || 0;
  const totalSessions = analytics.find(a => a.metric_type === 'user_session')?.unique_sessions || 0;
  const totalInteractions = analytics.find(a => a.metric_type === 'ad_interaction')?.total_count || 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-hierarchy-primary">Analytics Dashboard</h1>
          <p className="text-hierarchy-body">Monitor your website's performance and user behavior</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Last update: {lastUpdate.toLocaleTimeString()}
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchAnalytics}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Tabs value={timeRange} onValueChange={setTimeRange}>
            <TabsList>
              <TabsTrigger value="7">7 days</TabsTrigger>
              <TabsTrigger value="30">30 days</TabsTrigger>
              <TabsTrigger value="90">90 days</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-hierarchy-tertiary">Page Views</CardTitle>
            <Eye className="w-4 h-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-hierarchy-secondary">{totalPageViews.toLocaleString()}</div>
            <Badge variant="secondary" className="text-hierarchy-caption">Total visits</Badge>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-hierarchy-tertiary">Unique Sessions</CardTitle>
            <Users className="w-4 h-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-hierarchy-secondary">{totalSessions.toLocaleString()}</div>
            <Badge variant="secondary" className="text-hierarchy-caption">Active users</Badge>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-hierarchy-tertiary">Ad Interactions</CardTitle>
            <MousePointer className="w-4 h-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-hierarchy-secondary">{totalInteractions.toLocaleString()}</div>
            <Badge variant="secondary" className="text-hierarchy-caption">User engagement</Badge>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-hierarchy-tertiary">Conversion Rate</CardTitle>
            <TrendingUp className="w-4 h-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-hierarchy-secondary">
              {totalSessions > 0 ? ((totalInteractions / totalSessions) * 100).toFixed(1) : '0.0'}%
            </div>
            <Badge variant="secondary" className="text-hierarchy-caption">Engagement rate</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-hierarchy-tertiary">Daily Page Views</CardTitle>
            <CardDescription className="text-hierarchy-body">Page views over the selected time period</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={prepareChartData(analytics.find(a => a.metric_type === 'page_view')?.date_breakdown || {})}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 215, 0, 0.1)" />
                <XAxis dataKey="date" stroke="hsl(var(--foreground))" />
                <YAxis stroke="hsl(var(--foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    color: 'hsl(var(--foreground))'
                  }} 
                />
                <Line type="monotone" dataKey="count" stroke="#ffd700" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="card-enhanced">
          <CardHeader>
            <CardTitle className="text-hierarchy-tertiary">Metrics Distribution</CardTitle>
            <CardDescription className="text-hierarchy-body">Breakdown of different metric types</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.map((item, index) => ({
                    name: item.metric_type.replace('_', ' '),
                    value: item.total_count,
                    fill: colors[index % colors.length]
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {analytics.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    color: 'hsl(var(--foreground))'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics Table */}
      <Card className="card-enhanced">
        <CardHeader>
          <CardTitle className="text-hierarchy-tertiary">Detailed Metrics</CardTitle>
          <CardDescription className="text-hierarchy-body">Complete breakdown of all tracked metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.map((metric, index) => (
              <div key={index} className="flex items-center justify-between p-4 border border-yellow-700/30 rounded-lg hover:border-yellow-500/30 transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-yellow-400">{getMetricIcon(metric.metric_type)}</span>
                  <div>
                    <h3 className="font-medium capitalize text-yellow-300">{metric.metric_type.replace('_', ' ')}</h3>
                    <p className="text-sm text-hierarchy-body">
                      {metric.unique_sessions} unique sessions
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-hierarchy-secondary">{metric.total_count.toLocaleString()}</div>
                  <Badge variant="outline" className="text-hierarchy-caption">Total events</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};