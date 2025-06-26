
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Check, X, User, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

interface AdModerationModalProps {
  ad: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onModerationComplete: () => void;
}

const AdModerationModal = ({ ad, open, onOpenChange, onModerationComplete }: AdModerationModalProps) => {
  const [moderationAction, setModerationAction] = useState<'approve' | 'reject' | null>(null);
  const [selectedReason, setSelectedReason] = useState('');
  const [customNotes, setCustomNotes] = useState('');
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

      const { error } = await supabase
        .from('ads')
        .update(updateData)
        .eq('id', ad.id);
      
      if (error) {
        console.error('Error updating ad:', error);
        throw error;
      }
      
      console.log('Ad moderation completed successfully');
    },
    onSuccess: (_, variables) => {
      const actionText = variables.action === 'approve' ? 'approuvée' : 'rejetée';
      toast.success(`Annonce ${actionText} avec succès`);
      onModerationComplete();
      resetForm();
    },
    onError: (error) => {
      console.error('Moderation mutation error:', error);
      toast.error('Erreur lors du traitement de la modération');
    }
  });

  const resetForm = () => {
    setModerationAction(null);
    setSelectedReason('');
    setCustomNotes('');
  };

  const handleSubmit = () => {
    if (!moderationAction) return;
    
    console.log('Submitting moderation decision:', {
      action: moderationAction,
      reason: selectedReason,
      notes: customNotes
    });
    
    moderationMutation.mutate({
      action: moderationAction,
      reason: selectedReason,
      notes: customNotes
    });
  };

  const canSubmit = () => {
    if (!moderationAction) return false;
    if (moderationAction === 'approve') return true;
    // Pour le rejet, on doit avoir au moins une raison ou des notes
    return selectedReason || customNotes.trim();
  };

  if (!ad) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryDisplay = (category: string) => {
    const categories: { [key: string]: string } = {
      'rencontres': 'Rencontres',
      'massages': 'Massages',
      'produits': 'Produits adultes'
    };
    return categories[category] || category;
  };

  const getLocationDisplay = (location: string) => {
    const locations: { [key: string]: string } = {
      'douala': 'Douala',
      'yaounde': 'Yaoundé',
      'bafoussam': 'Bafoussam',
      'bamenda': 'Bamenda',
      'garoua': 'Garoua',
      'maroua': 'Maroua',
      'ngaoundere': 'Ngaoundéré',
      'bertoua': 'Bertoua',
      'ebolowa': 'Ebolowa',
      'kribi': 'Kribi',
      'limbe': 'Limbé',
      'buea': 'Buea',
      'edea': 'Edéa',
      'kumba': 'Kumba',
      'sangmelima': 'Sangmélima'
    };
    return locations[location] || location;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modération d'annonce</DialogTitle>
          <DialogDescription>
            Examinez l'annonce et prenez une décision de modération
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Aperçu de l'annonce */}
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-semibold">{ad.title}</h3>
              <Badge className={getStatusColor(ad.moderation_status)}>
                {ad.moderation_status === 'pending' ? 'En attente' :
                 ad.moderation_status === 'approved' ? 'Approuvée' : 'Rejetée'}
              </Badge>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>{getCategoryDisplay(ad.category)} • {getLocationDisplay(ad.location)}</p>
              <p>Créée le {new Date(ad.created_at).toLocaleDateString('fr-FR')}</p>
              {ad.price && <p className="text-lg font-semibold text-primary mt-2">{ad.price} FCFA</p>}
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <div className="p-3 bg-muted rounded-md max-h-32 overflow-y-auto">
                <p className="text-sm whitespace-pre-wrap">{ad.description}</p>
              </div>
            </div>

            {ad.images && ad.images.length > 0 ? (
              <div className="space-y-2">
                <Label>Images ({ad.images.length})</Label>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {ad.images.map((imageUrl: string, index: number) => (
                    <div key={index} className="aspect-square bg-muted rounded-lg overflow-hidden">
                      <img 
                        src={imageUrl} 
                        alt={`Image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Images</Label>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <User className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Aucune image</p>
                  </div>
                </div>
              </div>
            )}

            {ad.moderation_notes && (
              <div className="space-y-2">
                <Label>Notes de modération précédentes</Label>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm">{ad.moderation_notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Panel de modération */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Action de modération</h3>

            {ad.moderation_status === 'pending' ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={moderationAction === 'approve' ? 'default' : 'outline'}
                    onClick={() => {
                      setModerationAction('approve');
                      // Reset rejection fields when switching to approve
                      setSelectedReason('');
                      setCustomNotes('');
                    }}
                    className="flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Approuver
                  </Button>
                  <Button
                    variant={moderationAction === 'reject' ? 'destructive' : 'outline'}
                    onClick={() => setModerationAction('reject')}
                    className="flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Rejeter
                  </Button>
                </div>

                {moderationAction === 'reject' && (
                  <div className="space-y-4 p-4 border border-red-200 rounded-lg bg-red-50">
                    <div className="flex items-center gap-2 text-red-800 mb-2">
                      <AlertCircle className="w-4 h-4" />
                      <span className="font-medium">Raisons du rejet</span>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="reason">Raison prédéfinie (optionnel)</Label>
                      <Select value={selectedReason} onValueChange={setSelectedReason}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une raison" />
                        </SelectTrigger>
                        <SelectContent>
                          {moderationReasons?.map((reason) => (
                            <SelectItem key={reason.id} value={reason.id}>
                              {reason.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Message explicatif pour l'annonceur *</Label>
                      <Textarea
                        id="notes"
                        placeholder="Expliquez clairement à l'annonceur pourquoi son annonce est rejetée et comment il peut l'améliorer..."
                        value={customNotes}
                        onChange={(e) => setCustomNotes(e.target.value)}
                        rows={4}
                        className="resize-none"
                      />
                      <p className="text-xs text-muted-foreground">
                        Ce message sera visible par l'annonceur dans son tableau de bord
                      </p>
                    </div>

                    {!selectedReason && !customNotes.trim() && (
                      <div className="text-sm text-red-600 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Veuillez sélectionner une raison ou saisir un message explicatif
                      </div>
                    )}
                  </div>
                )}

                {moderationAction === 'approve' && (
                  <div className="p-4 border border-green-200 rounded-lg bg-green-50">
                    <div className="flex items-center gap-2 text-green-800">
                      <Check className="w-4 h-4" />
                      <span className="font-medium">Approbation de l'annonce</span>
                    </div>
                    <p className="text-sm text-green-700 mt-2">
                      Cette annonce sera approuvée et deviendra visible publiquement.
                    </p>
                  </div>
                )}

                {moderationAction && (
                  <div className="pt-4 border-t">
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSubmit}
                        disabled={moderationMutation.isPending || !canSubmit()}
                        className={moderationAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                      >
                        {moderationMutation.isPending ? 'Traitement...' : 
                         moderationAction === 'approve' ? 'Confirmer l\'approbation' : 'Confirmer le rejet'}
                      </Button>
                      <Button variant="outline" onClick={resetForm} disabled={moderationMutation.isPending}>
                        Annuler
                      </Button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Cette annonce a déjà été modérée le {new Date(ad.moderated_at).toLocaleDateString('fr-FR')}.
                </p>
                {ad.moderation_status === 'rejected' && ad.moderation_notes && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded">
                    <p className="text-sm font-medium text-red-800 mb-1">Raison du rejet :</p>
                    <p className="text-sm text-red-700">{ad.moderation_notes}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdModerationModal;
