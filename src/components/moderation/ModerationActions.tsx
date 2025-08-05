
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Check, X, AlertCircle } from 'lucide-react';

interface ModerationActionsProps {
  ad: any;
  moderationReasons: any[] | undefined;
  onSubmit: (action: 'approve' | 'reject', reason?: string, notes?: string, newCategory?: string) => void;
  isSubmitting: boolean;
}

const ModerationActions = ({ ad, moderationReasons, onSubmit, isSubmitting }: ModerationActionsProps) => {
  const [moderationAction, setModerationAction] = useState<'approve' | 'reject' | null>(null);
  const [selectedReason, setSelectedReason] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(ad?.category || '');

  // Liste des catégories disponibles
  const categories = [
    { value: 'rencontres', label: 'Rencontres' },
    { value: 'massages', label: 'Massages' },
    { value: 'produits', label: 'Produits' },
    { value: 'evenements', label: 'Événements' }
  ];

  const handleSubmit = () => {
    console.log('🔥 HANDLE SUBMIT CALLED');
    console.log('📋 Current form state:', { moderationAction, selectedReason, customNotes });
    console.log('✅ Can submit:', canSubmit());
    
    if (!moderationAction) {
      console.error('❌ No moderation action selected');
      return;
    }
    
    console.log('🚀 Calling onSubmit with:', { moderationAction, selectedReason, customNotes, selectedCategory });
    onSubmit(moderationAction, selectedReason, customNotes, selectedCategory);
  };

  const resetForm = () => {
    setModerationAction(null);
    setSelectedReason('');
    setCustomNotes('');
    setSelectedCategory(ad?.category || '');
  };

  const canSubmit = () => {
    if (!moderationAction) return false;
    if (moderationAction === 'approve') return true;
    return selectedReason || customNotes.trim();
  };

  if (ad.moderation_status !== 'pending') {
    return (
      <div className="p-4 bg-card border border-border rounded-lg">
        <p className="text-sm text-card-foreground font-medium">
          Cette annonce a déjà été modérée le {new Date(ad.moderated_at).toLocaleDateString('fr-FR')}.
        </p>
        {ad.moderation_status === 'rejected' && ad.moderation_notes && (
          <div className="mt-3 p-3 bg-destructive/10 border border-destructive/20 rounded">
            <p className="text-sm font-medium text-destructive mb-1">Raison du rejet :</p>
            <p className="text-sm text-foreground font-medium">{ad.moderation_notes}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 bg-card border border-border rounded-lg p-4">
      <h3 className="text-lg font-semibold text-primary">Action de modération</h3>

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
        <div className="space-y-4 p-4 border border-destructive/30 rounded-lg bg-destructive/10">
          <div className="flex items-center gap-2 text-foreground mb-2">
            <AlertCircle className="w-4 h-4 text-destructive" />
            <span className="font-medium">Raisons du rejet</span>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reason" className="text-foreground font-medium">Raison prédéfinie (optionnel)</Label>
            <Select value={selectedReason} onValueChange={setSelectedReason}>
              <SelectTrigger className="bg-background text-foreground border-border">
                <SelectValue placeholder="Sélectionnez une raison" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                {moderationReasons?.map((reason) => (
                  <SelectItem key={reason.id} value={reason.id} className="text-foreground">
                    {reason.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-foreground font-medium">Message explicatif pour l'annonceur *</Label>
            <Textarea
              id="notes"
              placeholder="Expliquez clairement à l'annonceur pourquoi son annonce est rejetée et comment il peut l'améliorer..."
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              rows={4}
              className="resize-none bg-background text-foreground border-border focus:border-primary"
            />
            <p className="text-xs text-foreground/70">
              Ce message sera visible par l'annonceur dans son tableau de bord
            </p>
          </div>

          {!selectedReason && !customNotes.trim() && (
            <div className="text-sm text-destructive flex items-center gap-2 bg-destructive/10 p-2 rounded-md border border-destructive/20">
              <AlertCircle className="w-4 h-4" />
              Veuillez sélectionner une raison ou saisir un message explicatif
            </div>
          )}
        </div>
      )}

      {moderationAction === 'approve' && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category" className="text-foreground font-medium">Catégorie de l'annonce</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="bg-background text-foreground border-border">
                <SelectValue placeholder="Sélectionnez une catégorie" />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value} className="text-foreground">
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCategory !== ad?.category && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-200 dark:border-yellow-800">
                ⚠️ Catégorie modifiée : "{categories.find(c => c.value === ad?.category)?.label}" → "{categories.find(c => c.value === selectedCategory)?.label}"
              </p>
            )}
          </div>
          
          <div className="p-4 border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-900/20">
            <div className="flex items-center gap-2 text-green-800 dark:text-green-400">
              <Check className="w-4 h-4" />
              <span className="font-medium">Approbation de l'annonce</span>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 mt-2">
              Cette annonce sera approuvée et deviendra visible publiquement.
            </p>
          </div>
        </div>
      )}

      {moderationAction && (
        <div className="pt-4 border-t border-border">
          <div className="flex gap-2">
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !canSubmit()}
              variant={moderationAction === 'approve' ? 'default' : 'destructive'}
              className={moderationAction === 'approve' 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : ''
              }
            >
              {isSubmitting ? 'Traitement...' : 
               moderationAction === 'approve' ? 'Confirmer l\'approbation' : 'Confirmer le rejet'}
            </Button>
            <Button variant="outline" onClick={resetForm} disabled={isSubmitting} className="text-foreground border-border">
              Annuler
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModerationActions;
