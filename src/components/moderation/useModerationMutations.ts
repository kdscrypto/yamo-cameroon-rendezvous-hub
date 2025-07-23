
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
      try {
        console.log('=== DÉBUT APPROBATION ANNONCE ===');
        console.log('ID annonce à approuver:', adId);
        console.log('Utilisateur actuel:', user?.id);
        console.log('Navigator online:', navigator.onLine);
        console.log('Window location:', window.location.href);
        
        if (!user?.id) {
          throw new Error('Utilisateur non connecté');
        }

        // Test de connectivité Supabase
        console.log('Test de connectivité Supabase...');
        const { data: testConnection, error: testError } = await supabase
          .from('ads')
          .select('id')
          .limit(1);
        
        if (testError) {
          console.error('Erreur test connectivité:', testError);
          throw new Error(`Problème de connexion Supabase: ${testError.message}`);
        }
        console.log('Connectivité Supabase OK');

        // First, get the ad details to check if it's VIP
        console.log('Récupération des détails de l\'annonce...');
        const { data: adData, error: fetchError } = await supabase
          .from('ads')
          .select('expires_at, title, moderation_status')
          .eq('id', adId)
          .single();
        
        if (fetchError) {
          console.error('Erreur lors de la récupération:', fetchError);
          throw fetchError;
        }

        console.log('Détails de l\'annonce:', adData);
        
        if (adData.moderation_status === 'approved') {
          console.log('Annonce déjà approuvée');
          return { isVip: false, alreadyApproved: true };
        }
        
        // Check if the ad is VIP (has expires_at and it's in the future)
        const isVip = adData.expires_at && new Date(adData.expires_at) > new Date();
        console.log('Annonce VIP:', isVip);
        
        const updateData = {
          moderation_status: 'approved' as const,
          status: 'active' as const,
          moderated_at: new Date().toISOString(),
          moderated_by: user.id
        };

        console.log('Données de mise à jour:', updateData);
        
        const { data: updateResult, error: updateError } = await supabase
          .from('ads')
          .update(updateData)
          .eq('id', adId)
          .select();
        
        if (updateError) {
          console.error('Erreur lors de la mise à jour:', updateError);
          throw updateError;
        }
        
        console.log('Résultat de la mise à jour:', updateResult);
        console.log('=== APPROBATION RÉUSSIE ===');
        
        return { isVip, alreadyApproved: false };
      } catch (error) {
        console.error('=== ERREUR LORS DE L\'APPROBATION ===');
        console.error('Erreur complète:', error);
        throw error;
      }
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
