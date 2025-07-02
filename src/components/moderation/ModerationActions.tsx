
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Check, X, AlertCircle } from 'lucide-react';

interface ModerationActionsProps {
  ad: any;
  moderationReasons: any[] | undefined;
  onSubmit: (action: 'approve' | 'reject', reason?: string, notes?: string) => void;
  isSubmitting: boolean;
}

const ModerationActions = ({ ad, moderationReasons, onSubmit, isSubmitting }: ModerationActionsProps) => {
  const [moderationAction, setModerationAction] = useState<'approve' | 'reject' | null>(null);
  const [selectedReason, setSelectedReason] = useState('');
  const [customNotes, setCustomNotes] = useState('');

  const handleSubmit = () => {
    if (!moderationAction) return;
    onSubmit(moderationAction, selectedReason, customNotes);
  };

  const resetForm = () => {
    setModerationAction(null);
    setSelectedReason('');
    setCustomNotes('');
  };

  const canSubmit = () => {
    if (!moderationAction) return false;
    if (moderationAction === 'approve') return true;
    return selectedReason || customNotes.trim();
  };

  if (ad.moderation_status !== 'pending') {
    return (
      <div className="p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          Cette annonce a déjà été modérée le {new Date(ad.moderated_at).toLocaleDateString('fr-FR')}.
        </p>
        {ad.moderation_status === 'rejected' && ad.moderation_notes && (
          <div className="mt-3 p-3 bg-muted/50 border border-muted rounded">
            <p className="text-sm font-medium text-foreground mb-1">Raison du rejet :</p>
            <p className="text-sm text-muted-foreground">{ad.moderation_notes}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Action de modération</h3>

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant={moderationAction === 'approve' ? 'default' : 'outline'}
          onClick={() => {
            setModerationAction('approve');
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
        <div className="space-y-4 p-4 border border-muted rounded-lg bg-muted/20">
          <div className="flex items-center gap-2 text-foreground mb-2">
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
            <div className="text-sm text-foreground flex items-center gap-2">
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
              disabled={isSubmitting || !canSubmit()}
              className={moderationAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-muted hover:bg-muted/80'}
            >
              {isSubmitting ? 'Traitement...' : 
               moderationAction === 'approve' ? 'Confirmer l\'approbation' : 'Confirmer le rejet'}
            </Button>
            <Button variant="outline" onClick={resetForm} disabled={isSubmitting}>
              Annuler
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModerationActions;
