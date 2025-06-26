
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export const useModerationMutations = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const invalidateQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['moderation-ads'] });
    queryClient.invalidateQueries({ queryKey: ['moderation-stats'] });
  };

  const quickApproveMutation = useMutation({
    mutationFn: async (adId: string) => {
      console.log('Quick approving ad:', adId);
      
      const { error } = await supabase
        .from('ads')
        .update({
          moderation_status: 'approved',
          status: 'active',
          moderated_at: new Date().toISOString(),
          moderated_by: user?.id
        })
        .eq('id', adId);
      
      if (error) {
        console.error('Error approving ad:', error);
        throw error;
      }
      
      console.log('Ad approved successfully');
    },
    onSuccess: () => {
      invalidateQueries();
      toast.success('Annonce approuvée avec succès');
    },
    onError: (error) => {
      console.error('Error in approval mutation:', error);
      toast.error('Erreur lors de l\'approbation de l\'annonce');
    }
  });

  const quickRejectMutation = useMutation({
    mutationFn: async ({ adId, message }: { adId: string; message: string }) => {
      console.log('Quick rejecting ad:', adId, 'with message:', message);
      
      const { error } = await supabase
        .from('ads')
        .update({
          moderation_status: 'rejected',
          status: 'inactive',
          moderated_at: new Date().toISOString(),
          moderated_by: user?.id,
          moderation_notes: message || 'Annonce rejetée par le modérateur'
        })
        .eq('id', adId);
      
      if (error) {
        console.error('Error rejecting ad:', error);
        throw error;
      }
      
      console.log('Ad rejected successfully');
    },
    onSuccess: () => {
      invalidateQueries();
      toast.success('Annonce rejetée avec succès');
    },
    onError: (error) => {
      console.error('Error in rejection mutation:', error);
      toast.error('Erreur lors du rejet de l\'annonce');
    }
  });

  return {
    quickApproveMutation,
    quickRejectMutation
  };
};
