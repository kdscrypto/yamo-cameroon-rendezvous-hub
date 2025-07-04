
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import AdModerationModal from './AdModerationModal';
import ModerationHeader from './ModerationHeader';
import AdsList from './AdsList';
import QuickModerationDialog from './QuickModerationDialog';
import WaitlistManagement from './WaitlistManagement';
import { useModerationMutations } from './useModerationMutations';

interface ModerationDashboardProps {
  userRole: 'moderator' | 'admin';
}

const ModerationDashboard = ({ userRole }: ModerationDashboardProps) => {
  const [selectedAd, setSelectedAd] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [quickModerationAd, setQuickModerationAd] = useState<any>(null);
  const [quickModerationAction, setQuickModerationAction] = useState<'approve' | 'reject' | null>(null);
  const [isQuickDialogOpen, setIsQuickDialogOpen] = useState(false);
  const { quickApproveMutation, quickRejectMutation } = useModerationMutations();

  // Set up real-time subscription for ads
  useEffect(() => {
    console.log('Setting up real-time subscription for moderation dashboard');
    
    const channel = supabase
      .channel('moderation-ads-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ads'
        },
        (payload) => {
          console.log('Moderation real-time update:', payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const { data: pendingAds, isLoading: pendingLoading } = useQuery({
    queryKey: ['moderation-ads', 'pending'],
    queryFn: async () => {
      console.log('Fetching pending ads for moderation');
      
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('moderation_status', 'pending')
        .order('created_at', { ascending: true });
      
      if (error) {
        console.error('Error fetching pending ads:', error);
        throw error;
      }
      
      console.log('Fetched pending ads:', data);
      return data;
    }
  });

  const { data: moderatedAds, isLoading: moderatedLoading } = useQuery({
    queryKey: ['moderation-ads', 'moderated'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .in('moderation_status', ['approved', 'rejected'])
        .order('moderated_at', { ascending: false })
        .limit(50);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: moderationStats } = useQuery({
    queryKey: ['moderation-stats'],
    queryFn: async () => {
      const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
        supabase.from('ads').select('id', { count: 'exact' }).eq('moderation_status', 'pending'),
        supabase.from('ads').select('id', { count: 'exact' }).eq('moderation_status', 'approved'),
        supabase.from('ads').select('id', { count: 'exact' }).eq('moderation_status', 'rejected')
      ]);

      return {
        pending: pendingCount.count || 0,
        approved: approvedCount.count || 0,
        rejected: rejectedCount.count || 0
      };
    }
  });

  const handleViewAd = (ad: any) => {
    console.log('Opening moderation modal for ad:', ad.id);
    setSelectedAd(ad);
    setIsModalOpen(true);
  };

  const handleQuickApprove = (ad: any) => {
    console.log('Quick approve triggered for ad:', ad.id);
    setQuickModerationAd(ad);
    setQuickModerationAction('approve');
    setIsQuickDialogOpen(true);
  };

  const handleQuickReject = (ad: any) => {
    console.log('Quick reject triggered for ad:', ad.id);
    setQuickModerationAd(ad);
    setQuickModerationAction('reject');
    setIsQuickDialogOpen(true);
  };

  const handleQuickModerationConfirm = (message?: string) => {
    if (!quickModerationAd) return;

    if (quickModerationAction === 'approve') {
      quickApproveMutation.mutate(quickModerationAd.id);
    } else if (quickModerationAction === 'reject' && message) {
      quickRejectMutation.mutate({ adId: quickModerationAd.id, message });
    }

    setIsQuickDialogOpen(false);
    setQuickModerationAd(null);
    setQuickModerationAction(null);
  };

  const handleModerationComplete = () => {
    console.log('Moderation completed, refreshing data');
    setIsModalOpen(false);
    setSelectedAd(null);
  };

  return (
    <div className="space-y-6">
      <ModerationHeader userRole={userRole} stats={moderationStats} />

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">
            En attente ({pendingAds?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="moderated">
            Modérées
          </TabsTrigger>
          <TabsTrigger value="waitlist">
            Liste d'attente
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="mt-6">
          <AdsList
            ads={pendingAds}
            isLoading={pendingLoading}
            showQuickActions={true}
            onViewAd={handleViewAd}
            onQuickApprove={handleQuickApprove}
            onQuickReject={handleQuickReject}
            isApproving={quickApproveMutation.isPending}
            isRejecting={quickRejectMutation.isPending}
            emptyMessage="Aucune annonce en attente de modération."
          />
        </TabsContent>
        
        <TabsContent value="moderated" className="mt-6">
          <AdsList
            ads={moderatedAds}
            isLoading={moderatedLoading}
            onViewAd={handleViewAd}
            emptyMessage="Aucune annonce modérée récemment."
          />
        </TabsContent>

        <TabsContent value="waitlist" className="mt-6">
          <WaitlistManagement />
        </TabsContent>
      </Tabs>

      <AdModerationModal
        ad={selectedAd}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onModerationComplete={handleModerationComplete}
      />

      <QuickModerationDialog
        ad={quickModerationAd}
        action={quickModerationAction}
        open={isQuickDialogOpen}
        onOpenChange={setIsQuickDialogOpen}
        onConfirm={handleQuickModerationConfirm}
        isSubmitting={quickApproveMutation.isPending || quickRejectMutation.isPending}
      />
    </div>
  );
};

export default ModerationDashboard;
