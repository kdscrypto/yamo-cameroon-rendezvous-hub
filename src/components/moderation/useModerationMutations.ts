
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
    // Invalidate public-facing queries to refresh the site content
    queryClient.invalidateQueries({ queryKey: ['approved-ads'] });
    queryClient.invalidateQueries({ queryKey: ['user-ads'] });
  };

  const quickApproveMutation = useMutation({
    mutationFn: async (adId: string) => {
      console.log('Quick approving ad:', adId);
      
      // First, get the ad details to check if it's VIP
      const { data: adData, error: fetchError } = await supabase
        .from('ads')
        .select('expires_at')
        .eq('id', adId)
        .single();
      
      if (fetchError) {
        console.error('Error fetching ad details:', fetchError);
        throw fetchError;
      }

      console.log('Ad details:', adData);
      
      // Check if the ad is VIP (has expires_at and it's in the future)
      const isVip = adData.expires_at && new Date(adData.expires_at) > new Date();
      console.log('Is VIP ad:', isVip);
      
      const updateData = {
        moderation_status: 'approved',
        status: 'active',
        moderated_at: new Date().toISOString(),
        moderated_by: user?.id
      };

      console.log('Updating ad with data:', updateData);
      
      const { error } = await supabase
        .from('ads')
        .update(updateData)
        .eq('id', adId);
      
      if (error) {
        console.error('Error approving ad:', error);
        throw error;
      }
      
      const statusMessage = isVip 
        ? 'Annonce VIP approuvée avec succès et maintenant visible sur le site avec mise en avant prioritaire'
        : 'Annonce approuvée avec succès et maintenant visible sur le site';
      
      console.log('Ad approved successfully:', statusMessage);
      return { isVip };
    },
    onSuccess: (data) => {
      invalidateQueries();
      const message = data.isVip 
        ? 'Annonce VIP approuvée avec succès et maintenant visible avec mise en avant prioritaire'
        : 'Annonce approuvée avec succès et maintenant visible sur le site';
      toast.success(message);
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
