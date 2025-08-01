
import { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User } from 'lucide-react';
import { toast } from 'sonner';
import WaitlistStats from './WaitlistStats';
import WaitlistFilters from './WaitlistFilters';
import WaitlistActions from './WaitlistActions';
import WaitlistTable from './WaitlistTable';
import WaitlistPagination from './WaitlistPagination';

const ITEMS_PER_PAGE = 20;

const WaitlistManagement = () => {
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'notified' | 'pending'>('all');
  const [dateFilter, setDateFilter] = useState<{ start?: Date; end?: Date }>({});
  const [currentPage, setCurrentPage] = useState(1);
  
  const queryClient = useQueryClient();

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
          event: '*',
          schema: 'public',
          table: 'event_waitlist'
        },
        (payload) => {
          console.log('Waitlist real-time update:', payload);
          refetch();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  // Filter and paginate data
  const filteredEntries = useMemo(() => {
    if (!waitlistEntries) return [];

    return waitlistEntries.filter(entry => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        if (!entry.email.toLowerCase().includes(searchLower) && 
            !(entry.full_name?.toLowerCase().includes(searchLower))) {
          return false;
        }
      }

      // Status filter
      if (statusFilter === 'notified' && !entry.notified) return false;
      if (statusFilter === 'pending' && entry.notified) return false;

      // Date filter
      if (dateFilter.start) {
        const entryDate = new Date(entry.created_at);
        if (entryDate < dateFilter.start) return false;
      }
      if (dateFilter.end) {
        const entryDate = new Date(entry.created_at);
        const endDate = new Date(dateFilter.end);
        endDate.setHours(23, 59, 59, 999); // End of day
        if (entryDate > endDate) return false;
      }

      return true;
    });
  }, [waitlistEntries, searchTerm, statusFilter, dateFilter]);

  const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);
  const paginatedEntries = filteredEntries.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, dateFilter]);

  const markAsNotifiedMutation = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase
        .from('event_waitlist')
        .update({ notified: true })
        .eq('email', email);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Personne marquée comme notifiée');
      queryClient.invalidateQueries({ queryKey: ['event-waitlist'] });
      queryClient.invalidateQueries({ queryKey: ['waitlist-detailed-stats'] });
    },
    onError: (error) => {
      console.error('Error marking as notified:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  });

  const deleteEntryMutation = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase
        .from('event_waitlist')
        .delete()
        .eq('email', email);
      
      if (error) throw error;
    },
    onSuccess: (_, deletedEmail) => {
      toast.success('Inscription supprimée');
      queryClient.invalidateQueries({ queryKey: ['event-waitlist'] });
      queryClient.invalidateQueries({ queryKey: ['waitlist-detailed-stats'] });
      setSelectedEmails(prev => prev.filter(email => email !== deletedEmail));
    },
    onError: (error) => {
      console.error('Error deleting entry:', error);
      toast.error('Erreur lors de la suppression');
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
      {/* Enhanced Stats */}
      <WaitlistStats />

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Liste d'attente événements</CardTitle>
              <CardDescription>
                Gestion avancée des inscriptions pour les événements spéciaux
              </CardDescription>
            </div>
            <WaitlistActions 
              selectedEmails={selectedEmails}
              onSelectionChange={setSelectedEmails}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <WaitlistFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
          />

          {filteredEntries.length === 0 ? (
            <div className="text-center py-8">
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                {waitlistEntries?.length === 0 
                  ? "Aucune inscription à la liste d'attente"
                  : "Aucun résultat pour les filtres sélectionnés"
                }
              </p>
            </div>
          ) : (
            <>
              <WaitlistTable
                entries={paginatedEntries}
                selectedEmails={selectedEmails}
                onSelectionChange={setSelectedEmails}
                onMarkAsNotified={(email) => markAsNotifiedMutation.mutate(email)}
                onDelete={(email) => deleteEntryMutation.mutate(email)}
              />
              
              <WaitlistPagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredEntries.length}
                itemsPerPage={ITEMS_PER_PAGE}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WaitlistManagement;
