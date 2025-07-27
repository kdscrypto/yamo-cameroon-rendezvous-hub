
import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Check, X, AlertCircle } from 'lucide-react';

interface QuickModerationDialogProps {
  ad: any;
  action: 'approve' | 'reject' | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (message?: string) => void;
  isSubmitting: boolean;
}

const QuickModerationDialog = ({ 
  ad, 
  action, 
  open, 
  onOpenChange, 
  onConfirm, 
  isSubmitting 
}: QuickModerationDialogProps) => {
  const [message, setMessage] = useState('');

  const handleConfirm = () => {
    onConfirm(action === 'reject' ? message : undefined);
    setMessage('');
  };

  const handleCancel = () => {
    onOpenChange(false);
    setMessage('');
  };

  if (!action || !ad) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {action === 'approve' ? (
              <>
                <Check className="w-5 h-5 text-green-600" />
                Confirmer l'approbation
              </>
            ) : (
              <>
                <X className="w-5 h-5 text-foreground" />
                Confirmer le rejet
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            Annonce : "{ad.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {action === 'approve' ? (
            <div className="p-4 border border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-900/20">
              <div className="flex items-center gap-2 text-green-800 dark:text-green-400">
                <Check className="w-4 h-4" />
                <span className="font-medium">Cette annonce sera approuvée</span>
              </div>
              <p className="text-sm text-green-700 dark:text-green-300 mt-2">
                L'annonce deviendra visible publiquement.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 border border-destructive/30 rounded-lg bg-destructive/10">
                <div className="flex items-center gap-2 text-foreground mb-2">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <span className="font-medium text-foreground">Cette annonce sera rejetée</span>
                </div>
                <p className="text-sm text-foreground/80">
                  Veuillez expliquer la raison du rejet à l'annonceur.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rejection-message" className="text-foreground font-medium">Message d'explication *</Label>
                <Textarea
                  id="rejection-message"
                  placeholder="Expliquez clairement pourquoi cette annonce est rejetée..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="resize-none bg-background text-foreground border-border focus:border-primary"
                />
                <p className="text-xs text-foreground/70">
                  Ce message sera visible par l'annonceur
                </p>
              </div>

              {!message.trim() && (
                <div className="text-sm text-destructive flex items-center gap-2 bg-destructive/10 p-2 rounded-md border border-destructive/20">
                  <AlertCircle className="w-4 h-4" />
                  Un message d'explication est requis pour le rejet
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleConfirm}
              disabled={isSubmitting || (action === 'reject' && !message.trim())}
              className={action === 'approve' 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
              }
            >
              {isSubmitting ? 'Traitement...' : 
               action === 'approve' ? 'Confirmer l\'approbation' : 'Confirmer le rejet'}
            </Button>
            <Button variant="outline" onClick={handleCancel} disabled={isSubmitting} className="text-foreground border-border">
              Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickModerationDialog;
