
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Mail, Calendar, User } from 'lucide-react';
import { useEffect } from 'react';

const WaitlistManagement = () => {
  const { data: waitlistEntries, isLoading, refetch } = useQuery({
    queryKey: ['event-waitlist'],
    queryFn: async () => {
      console.log('Fetching event waitlist entries');
      
      const { data, error } = await supabase
        .from('event_waitlist')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching waitlist:', error);
        throw error;
      }
      
      console.log('Fetched waitlist entries:', data);
      return data;
    }
  });

  // Set up real-time subscription for waitlist updates
  useEffect(() => {
    console.log('Setting up real-time subscription for event waitlist');
    
    const channel = supabase
      .channel('waitlist-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'event_waitlist'
        },
        (payload) => {
          console.log('New waitlist signup:', payload);
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  const { data: waitlistStats } = useQuery({
    queryKey: ['waitlist-stats'],
    queryFn: async () => {
      const [totalCount, todayCount, notifiedCount] = await Promise.all([
        supabase.from('event_waitlist').select('id', { count: 'exact' }),
        supabase
          .from('event_waitlist')
          .select('id', { count: 'exact' })
          .gte('created_at', new Date().toISOString().split('T')[0]),
        supabase.from('event_waitlist').select('id', { count: 'exact' }).eq('notified', true)
      ]);

      return {
        total: totalCount.count || 0,
        today: todayCount.count || 0,
        notified: notifiedCount.count || 0
      };
    }
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Liste d'attente événements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total inscriptions</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{waitlistStats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              Personnes inscrites
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Aujourd'hui</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foregreen" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{waitlistStats?.today || 0}</div>
            <p className="text-xs text-muted-foreground">
              Nouvelles inscriptions
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notifiées</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{waitlistStats?.notified || 0}</div>
            <p className="text-xs text-muted-foreground">
              Personnes contactées
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Waitlist Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste d'attente événements</CardTitle>
          <CardDescription>
            Personnes inscrites pour être notifiées des événements spéciaux
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!waitlistEntries || waitlistEntries.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune inscription à la liste d'attente</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Nom complet</TableHead>
                  <TableHead>Date d'inscription</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {waitlistEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell className="font-medium">{entry.email}</TableCell>
                    <TableCell>{entry.full_name || '-'}</TableCell>
                    <TableCell>
                      {new Date(entry.created_at).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={entry.notified ? "default" : "secondary"}>
                        {entry.notified ? 'Notifié' : 'En attente'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WaitlistManagement;
