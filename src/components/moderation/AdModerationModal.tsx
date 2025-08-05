
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import AdPreviewSection from './AdPreviewSection';
import AdFullPreview from './AdFullPreview';
import ModerationActions from './ModerationActions';
import { useModerationMutations } from './useModerationMutations';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AdModerationModalProps {
  ad: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onModerationComplete: () => void;
}

const AdModerationModal = ({ ad, open, onOpenChange, onModerationComplete }: AdModerationModalProps) => {
  const { quickApproveMutation, quickRejectMutation } = useModerationMutations();

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

  const handleModerationSubmit = (action: 'approve' | 'reject', reason?: string, notes?: string, newCategory?: string) => {
    console.log('🎯 MODAL SUBMIT HANDLER CALLED:', { action, reason, notes, newCategory });
    
    if (action === 'approve') {
      const params = newCategory ? { adId: ad.id, newCategory } : ad.id;
      quickApproveMutation.mutate(params, {
        onSuccess: () => onModerationComplete()
      });
    } else {
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
      
      quickRejectMutation.mutate({ adId: ad.id, message: moderationNotes }, {
        onSuccess: () => onModerationComplete()
      });
    }
  };

  if (!ad) return null;

  // Check if the ad is VIP for display purposes
  const isVip = ad.expires_at && new Date(ad.expires_at) > new Date();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto bg-background">
        <DialogHeader className="border-b border-border pb-4">
          <DialogTitle className="flex items-center gap-2 text-hierarchy-secondary">
            Modération d'annonce
            {isVip && (
              <span className="text-sm bg-primary text-primary-foreground px-2 py-1 rounded-full font-medium">
                VIP
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="text-hierarchy-body">
            Examinez l'annonce et prenez une décision de modération
            {isVip && ' (Cette annonce bénéficiera d\'une mise en avant prioritaire si approuvée)'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted">
            <TabsTrigger value="preview" className="text-hierarchy-body data-[state=active]:bg-background data-[state=active]:text-hierarchy-tertiary font-medium">
              Aperçu public
            </TabsTrigger>
            <TabsTrigger value="moderation" className="text-hierarchy-body data-[state=active]:bg-background data-[state=active]:text-hierarchy-tertiary font-medium">
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
                isSubmitting={quickApproveMutation.isPending || quickRejectMutation.isPending}
              />
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AdModerationModal;
