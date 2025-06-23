
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Check, X, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const { data: moderationReasons } = useQuery({
    queryKey: ['moderation-reasons'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('moderation_reasons')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const moderationMutation = useMutation({
    mutationFn: async ({ action, reason, notes }: { action: 'approve' | 'reject'; reason?: string; notes?: string }) => {
      const updateData: any = {
        moderation_status: action === 'approve' ? 'approved' : 'rejected',
        status: action === 'approve' ? 'active' : 'inactive',
        moderated_at: new Date().toISOString()
      };

      if (action === 'reject') {
        let moderationNotes = notes || '';
        if (reason) {
          const reasonObj = moderationReasons?.find(r => r.id === reason);
          if (reasonObj) {
            moderationNotes = `${reasonObj.name}${notes ? ': ' + notes : ''}`;
          }
        }
        updateData.moderation_notes = moderationNotes;
      }

      const { error } = await supabase
        .from('ads')
        .update(updateData)
        .eq('id', ad.id);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.action === 'approve' ? "Annonce approuvée" : "Annonce rejetée",
        description: `L'annonce a été ${variables.action === 'approve' ? 'approuvée' : 'rejetée'} avec succès.`,
      });
      onModerationComplete();
      resetForm();
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de traiter la modération.",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setModerationAction(null);
    setSelectedReason('');
    setCustomNotes('');
  };

  const handleSubmit = () => {
    if (!moderationAction) return;
    
    moderationMutation.mutate({
      action: moderationAction,
      reason: selectedReason,
      notes: customNotes
    });
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
              <p>{ad.category} • {ad.location}</p>
              <p>Créée le {new Date(ad.created_at).toLocaleDateString('fr-FR')}</p>
              {ad.price && <p className="text-lg font-semibold text-primary mt-2">{ad.price} FCFA</p>}
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm">{ad.description}</p>
              </div>
            </div>

            {ad.images && ad.images.length > 0 && (
              <div className="space-y-2">
                <Label>Images ({ad.images.length})</Label>
                <div className="grid grid-cols-2 gap-2">
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
            )}

            {(!ad.images || ad.images.length === 0) && (
              <div className="space-y-2">
                <Label>Images</Label>
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                  <User className="w-12 h-12 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground ml-2">Aucune image</p>
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

            {ad.moderation_status === 'pending' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={moderationAction === 'approve' ? 'default' : 'outline'}
                    onClick={() => setModerationAction('approve')}
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
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reason">Raison du rejet</Label>
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
                      <Label htmlFor="notes">Notes additionnelles (optionnel)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Ajoutez des détails sur la raison du rejet..."
                        value={customNotes}
                        onChange={(e) => setCustomNotes(e.target.value)}
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {moderationAction && (
                  <div className="pt-4 border-t">
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSubmit}
                        disabled={moderationMutation.isPending || (moderationAction === 'reject' && !selectedReason)}
                        className={moderationAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                      >
                        {moderationMutation.isPending ? 'Traitement...' : 
                         moderationAction === 'approve' ? 'Confirmer l\'approbation' : 'Confirmer le rejet'}
                      </Button>
                      <Button variant="outline" onClick={resetForm}>
                        Annuler
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            {ad.moderation_status !== 'pending' && (
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Cette annonce a déjà été modérée le {new Date(ad.moderated_at).toLocaleDateString('fr-FR')}.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdModerationModal;
