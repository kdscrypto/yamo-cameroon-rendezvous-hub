
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
            <div className="p-4 border border-green-200 rounded-lg bg-green-50">
              <div className="flex items-center gap-2 text-green-800">
                <Check className="w-4 h-4" />
                <span className="font-medium">Cette annonce sera approuvée</span>
              </div>
              <p className="text-sm text-green-700 mt-2">
                L'annonce deviendra visible publiquement.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 border border-muted rounded-lg bg-muted/20">
                <div className="flex items-center gap-2 text-foreground mb-2">
                  <AlertCircle className="w-4 h-4" />
                  <span className="font-medium">Cette annonce sera rejetée</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Veuillez expliquer la raison du rejet à l'annonceur.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rejection-message">Message d'explication *</Label>
                <Textarea
                  id="rejection-message"
                  placeholder="Expliquez clairement pourquoi cette annonce est rejetée..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground">
                  Ce message sera visible par l'annonceur
                </p>
              </div>

              {!message.trim() && (
                <div className="text-sm text-foreground flex items-center gap-2">
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
                ? 'bg-green-600 hover:bg-green-700' 
                : 'bg-muted hover:bg-muted/80'
              }
            >
              {isSubmitting ? 'Traitement...' : 
               action === 'approve' ? 'Confirmer l\'approbation' : 'Confirmer le rejet'}
            </Button>
            <Button variant="outline" onClick={handleCancel} disabled={isSubmitting}>
              Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QuickModerationDialog;
