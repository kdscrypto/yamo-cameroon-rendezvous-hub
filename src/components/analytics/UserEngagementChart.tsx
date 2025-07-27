import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface EngagementData {
  date: string;
  users: number;
  sessions: number;
  engagement: number;
}

interface UserEngagementChartProps {
  data?: EngagementData[];
}

export const UserEngagementChart = ({ data = [] }: UserEngagementChartProps) => {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg shadow-lg p-3">
          <p className="font-medium">{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
              {entry.dataKey === 'engagement' && '%'}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center text-muted-foreground">
        Aucune donnée d'engagement disponible
      </div>
    );
  }

  return (
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            className="text-xs"
          />
          <YAxis className="text-xs" />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="users"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            name="Utilisateurs"
            dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="sessions"
            stroke="hsl(var(--secondary))"
            strokeWidth={2}
            name="Sessions"
            dot={{ fill: 'hsl(var(--secondary))', strokeWidth: 2, r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="engagement"
            stroke="hsl(var(--accent))"
            strokeWidth={2}
            name="Engagement (%)"
            dot={{ fill: 'hsl(var(--accent))', strokeWidth: 2, r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};