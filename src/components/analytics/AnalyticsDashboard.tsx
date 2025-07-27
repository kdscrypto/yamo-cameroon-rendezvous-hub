import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, Users, MousePointer, TrendingUp, RotateCcw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

// Mock data that matches the screenshots
const mockData = {
  pageViews: 16906,
  uniqueSessions: 5354, 
  adInteractions: 5662,
  conversionRate: 105.8,
  dailyPageViews: [
    { date: '2025-07-21', views: 100 },
    { date: '2025-07-22', views: 3000 },
    { date: '2025-07-23', views: 2500 },
    { date: '2025-07-24', views: 2300 },
    { date: '2025-07-25', views: 2500 },
    { date: '2025-07-26', views: 4000 },
    { date: '2025-07-27', views: 2800 }
  ],
  metricsDistribution: [
    { name: 'page view', value: 58, color: '#10B981' },
    { name: 'user session', value: 23, color: '#F59E0B' },
    { name: 'ad interaction', value: 19, color: '#8B5CF6' }
  ],
  detailedMetrics: [
    { type: 'Ad Interaction', totalEvents: 5662, uniqueSessions: 597, icon: MousePointer },
    { type: 'Page View', totalEvents: 16910, uniqueSessions: 5505, icon: Eye },
    { type: 'User Session', totalEvents: 6748, uniqueSessions: 5356, icon: Users }
  ]
};

const AnalyticsDashboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7 days');
  const [lastUpdate] = useState(new Date().toLocaleTimeString('fr-FR'));

  const handleRefresh = () => {
    // In a real app, this would refresh the data
    window.location.reload();
  };

  return (
    <div className="space-y-6 p-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Monitor your website's performance and user behavior</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">Last update: {lastUpdate}</span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Refresh
          </Button>
          <div className="flex gap-2">
            {['7 days', '30 days', '90 days'].map((period) => (
              <Button
                key={period}
                variant={selectedPeriod === period ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPeriod(period)}
              >
                {period}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-primary">Page Views</CardTitle>
            <Eye className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{mockData.pageViews.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Total visits</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-primary">Unique Sessions</CardTitle>
            <Users className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{mockData.uniqueSessions.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">Active users</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-primary">Ad Interactions</CardTitle>
            <MousePointer className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{mockData.adInteractions.toLocaleString()}</div>
            <p className="text-sm text-muted-foreground">User engagement</p>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-lg font-semibold text-primary">Conversion Rate</CardTitle>
            <TrendingUp className="h-6 w-6 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{mockData.conversionRate}%</div>
            <p className="text-sm text-muted-foreground">Engagement rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Page Views Chart */}
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-primary">Daily Page Views</CardTitle>
            <CardDescription>Page views over the selected time period</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData.dailyPageViews}>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="views" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Metrics Distribution Pie Chart */}
        <Card className="bg-card/50 backdrop-blur border-border/50">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-primary">Metrics Distribution</CardTitle>
            <CardDescription>Breakdown of different metric types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mockData.metricsDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    dataKey="value"
                    label={({ name, value }) => `${name} ${value}%`}
                  >
                    {mockData.metricsDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <Card className="bg-card/50 backdrop-blur border-border/50">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-primary">Detailed Metrics</CardTitle>
          <CardDescription>Complete breakdown of all tracked metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {mockData.detailedMetrics.map((metric, index) => {
              const IconComponent = metric.icon;
              return (
                <div key={index} className="flex items-center justify-between p-4 border border-border/50 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-4">
                    <IconComponent className="h-6 w-6 text-primary" />
                    <div>
                      <h3 className="text-lg font-semibold text-primary">{metric.type}</h3>
                      <p className="text-sm text-muted-foreground">{metric.uniqueSessions} unique sessions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-foreground">{metric.totalEvents.toLocaleString()}</div>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Total events</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;