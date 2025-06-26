
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import AdPreviewSection from './AdPreviewSection';
import ModerationActions from './ModerationActions';

interface AdModerationModalProps {
  ad: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onModerationComplete: () => void;
}

const AdModerationModal = ({ ad, open, onOpenChange, onModerationComplete }: AdModerationModalProps) => {
  const { user } = useAuth();

  const { data: moderationReasons } = useQuery({
    queryKey: ['moderation-reasons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('moderation_reasons')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching moderation reasons:', error);
        return [];
      }
      return data;
    }
  });

  const moderationMutation = useMutation({
    mutationFn: async ({ action, reason, notes }: { action: 'approve' | 'reject'; reason?: string; notes?: string }) => {
      console.log('Processing moderation:', { action, reason, notes, adId: ad.id });
      
      // Check if the ad is VIP (has expires_at and it's in the future)
      const isVip = ad.expires_at && new Date(ad.expires_at) > new Date();
      console.log('Is VIP ad:', isVip);
      
      const updateData: any = {
        moderation_status: action === 'approve' ? 'approved' : 'rejected',
        status: action === 'approve' ? 'active' : 'inactive',
        moderated_at: new Date().toISOString(),
        moderated_by: user?.id
      };

      if (action === 'reject') {
        let moderationNotes = '';
        
        if (reason) {
          const reasonObj = moderationReasons?.find(r => r.id === reason);
          if (reasonObj) {
            moderationNotes = reasonObj.name;
            if (notes) {
              moderationNotes += ` - ${notes}`;
            }
          }
        } else if (notes) {
          moderationNotes = notes;
        } else {
          moderationNotes = 'Annonce rejetée par le modérateur';
        }
        
        updateData.moderation_notes = moderationNotes;
        console.log('Setting moderation notes:', moderationNotes);
      }

      console.log('Updating ad with data:', updateData);

      const { error } = await supabase
        .from('ads')
        .update(updateData)
        .eq('id', ad.id);
      
      if (error) {
        console.error('Error updating ad:', error);
        throw error;
      }
      
      const statusMessage = action === 'approve' 
        ? (isVip ? 'Annonce VIP approuvée - visible avec mise en avant prioritaire' : 'Annonce approuvée - maintenant visible sur le site')
        : 'Annonce rejetée';
      
      console.log('Ad moderation completed successfully:', statusMessage);
      return { action, isVip };
    },
    onSuccess: (data, variables) => {
      const { action, isVip } = data;
      let message = '';
      
      if (action === 'approve') {
        message = isVip 
          ? 'Annonce VIP approuvée avec succès et maintenant visible avec mise en avant prioritaire'
          : 'Annonce approuvée avec succès et maintenant visible sur le site';
      } else {
        message = 'Annonce rejetée avec succès';
      }
      
      toast.success(message);
      onModerationComplete();
    },
    onError: (error) => {
      console.error('Moderation mutation error:', error);
      toast.error('Erreur lors du traitement de la modération');
    }
  });

  const handleModerationSubmit = (action: 'approve' | 'reject', reason?: string, notes?: string) => {
    console.log('Submitting moderation decision:', { action, reason, notes });
    moderationMutation.mutate({ action, reason, notes });
  };

  if (!ad) return null;

  // Check if the ad is VIP for display purposes
  const isVip = ad.expires_at && new Date(ad.expires_at) > new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Modération d'annonce
            {isVip && (
              <span className="text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                VIP
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Examinez l'annonce et prenez une décision de modération
            {isVip && ' (Cette annonce bénéficiera d\'une mise en avant prioritaire si approuvée)'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AdPreviewSection ad={ad} />
          <ModerationActions 
            ad={ad}
            moderationReasons={moderationReasons}
            onSubmit={handleModerationSubmit}
            isSubmitting={moderationMutation.isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdModerationModal;
