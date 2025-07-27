
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
        
        if (!user?.id) {
          throw new Error('Utilisateur non connecté');
        }

        // First, get the ad details to check if it's VIP and current status
        console.log('Récupération des détails de l\'annonce...');
        const { data: adData, error: fetchError } = await supabase
          .from('ads')
          .select('expires_at, title, moderation_status, status, user_id')
          .eq('id', adId)
          .single();
        
        if (fetchError) {
          console.error('Erreur lors de la récupération:', fetchError);
          throw new Error(`Impossible de récupérer l'annonce: ${fetchError.message}`);
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
        
        // Use explicit where conditions and return the updated row
        const { data: updateResult, error: updateError } = await supabase
          .from('ads')
          .update(updateData)
          .eq('id', adId)
          .eq('moderation_status', 'pending') // Only update if still pending
          .select('id, moderation_status, status, moderated_at, moderated_by')
          .single();
        
        if (updateError) {
          console.error('Erreur lors de la mise à jour:', updateError);
          throw new Error(`Échec de l'approbation: ${updateError.message}`);
        }
        
        if (!updateResult) {
          throw new Error('Aucune ligne mise à jour - l\'annonce a peut-être déjà été modérée');
        }
        
        console.log('Résultat de la mise à jour:', updateResult);
        
        // Verify the update was successful
        if (updateResult.moderation_status !== 'approved' || updateResult.status !== 'active') {
          throw new Error('La mise à jour a échoué - statut incorrect après mise à jour');
        }
        
        console.log('=== APPROBATION RÉUSSIE ===');
        
        return { isVip, alreadyApproved: false, updatedAd: updateResult };
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
      console.log('=== DÉBUT REJET ANNONCE ===');
      console.log('ID annonce à rejeter:', adId);
      console.log('Message de rejet:', message);
      console.log('Utilisateur actuel:', user?.id);
      
      if (!user?.id) {
        throw new Error('Utilisateur non connecté');
      }

      if (!message || !message.trim()) {
        throw new Error('Le message de rejet est obligatoire');
      }
      
      const updateData = {
        moderation_status: 'rejected' as const,
        status: 'inactive' as const,
        moderated_at: new Date().toISOString(),
        moderated_by: user.id,
        moderation_notes: message.trim()
      };

      console.log('Données de mise à jour:', updateData);
      
      const { data, error } = await supabase
        .from('ads')
        .update(updateData)
        .eq('id', adId)
        .eq('moderation_status', 'pending') // Only update if still pending
        .select('id, moderation_status, status, moderated_at, moderated_by, moderation_notes')
        .single();
      
      if (error) {
        console.error('Erreur lors du rejet:', error);
        throw new Error(`Échec du rejet: ${error.message}`);
      }
      
      if (!data) {
        throw new Error('Aucune ligne mise à jour - l\'annonce a peut-être déjà été modérée');
      }
      
      console.log('Résultat du rejet:', data);
      console.log('=== REJET RÉUSSI ===');
      
      return data;
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
