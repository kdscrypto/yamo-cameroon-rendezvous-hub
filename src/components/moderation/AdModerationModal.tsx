
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import AdPreviewSection from './AdPreviewSection';
import AdFullPreview from './AdFullPreview';
import ModerationActions from './ModerationActions';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AdModerationModalProps {
  ad: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onModerationComplete: () => void;
}

const AdModerationModal = ({ ad, open, onOpenChange, onModerationComplete }: AdModerationModalProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

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
    mutationFn: async ({ action, reason, notes, newCategory }: { action: 'approve' | 'reject'; reason?: string; notes?: string; newCategory?: string }) => {
      console.log('🚀 STARTING MODERATION PROCESS:', { action, reason, notes, adId: ad.id });
      console.log('📊 AD DATA:', ad);
      console.log('👤 USER ID:', user?.id);
      
      // Validate user authentication
      if (!user?.id) {
        console.error('❌ NO USER ID - User not authenticated');
        throw new Error('Utilisateur non authentifié');
      }
      
      try {
        // Check if the ad is VIP (has expires_at and it's in the future)
        const isVip = ad.expires_at && new Date(ad.expires_at) > new Date();
        console.log('⭐ Is VIP ad:', isVip);
        
        const updateData: any = {
          moderation_status: action === 'approve' ? 'approved' : 'rejected',
          status: action === 'approve' ? 'active' : 'inactive',
          moderated_at: new Date().toISOString(),
          moderated_by: user.id
        };

        // Update category if provided and different from current
        if (action === 'approve' && newCategory && newCategory !== ad.category) {
          updateData.category = newCategory;
          console.log('🏷️ Updating category from', ad.category, 'to', newCategory);
        }

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
          console.log('📝 Setting moderation notes:', moderationNotes);
        }

        console.log('📤 SENDING UPDATE TO SUPABASE:', updateData);

        const { data, error } = await supabase
          .from('ads')
          .update(updateData)
          .eq('id', ad.id)
          .select();
        
        if (error) {
          console.error('❌ SUPABASE ERROR:', error);
          throw error;
        }
        
        console.log('✅ SUPABASE UPDATE SUCCESS:', data);
        
        const statusMessage = action === 'approve' 
          ? (isVip ? 'Annonce VIP approuvée - visible avec mise en avant prioritaire' : 'Annonce approuvée - maintenant visible sur le site')
          : 'Annonce rejetée';
        
        console.log('🎉 Ad moderation completed successfully:', statusMessage);
        return { action, isVip };
      } catch (error) {
        console.error('💥 MUTATION ERROR:', error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ['moderation-ads'] });
      queryClient.invalidateQueries({ queryKey: ['approved-ads'] });
      queryClient.invalidateQueries({ queryKey: ['ads'] });
      queryClient.invalidateQueries({ queryKey: ['pending-ads'] });
      
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

  const handleModerationSubmit = (action: 'approve' | 'reject', reason?: string, notes?: string, newCategory?: string) => {
    console.log('🎯 MODAL SUBMIT HANDLER CALLED:', { action, reason, notes });
    console.log('🔄 Mutation state:', { 
      isPending: moderationMutation.isPending, 
      isError: moderationMutation.isError,
      error: moderationMutation.error 
    });
    
    try {
      console.log('🚀 CALLING MUTATION...');
      moderationMutation.mutate({ action, reason, notes, newCategory });
    } catch (error) {
      console.error('💥 ERROR IN SUBMIT HANDLER:', error);
    }
  };

  if (!ad) return null;

  // Check if the ad is VIP for display purposes
  const isVip = ad.expires_at && new Date(ad.expires_at) > new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto bg-background">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="flex items-center gap-2 text-primary">
            Modération d'annonce
            {isVip && (
              <span className="text-sm bg-primary text-primary-foreground px-2 py-1 rounded-full font-medium">
                VIP
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Examinez l'annonce et prenez une décision de modération
            {isVip && ' (Cette annonce bénéficiera d\'une mise en avant prioritaire si approuvée)'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted">
            <TabsTrigger value="preview" className="text-foreground data-[state=active]:bg-background data-[state=active]:text-primary">
              Aperçu public
            </TabsTrigger>
            <TabsTrigger value="moderation" className="text-foreground data-[state=active]:bg-background data-[state=active]:text-primary">
              Modération
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="preview" className="mt-6">
            <AdFullPreview ad={ad} />
          </TabsContent>
          
          <TabsContent value="moderation" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AdPreviewSection ad={ad} />
              <ModerationActions 
                ad={ad}
                moderationReasons={moderationReasons}
                onSubmit={handleModerationSubmit}
                isSubmitting={moderationMutation.isPending}
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AdModerationModal;
