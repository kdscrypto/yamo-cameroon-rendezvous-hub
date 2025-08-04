import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Mail, Download, Trash2, Check, Send } from 'lucide-react';
import { toast } from 'sonner';
import EmailNotificationModal from './EmailNotificationModal';

interface WaitlistActionsProps {
  selectedEmails: string[];
  onSelectionChange: (emails: string[]) => void;
}

const WaitlistActions = ({ selectedEmails, onSelectionChange }: WaitlistActionsProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const queryClient = useQueryClient();

  const markAsNotifiedMutation = useMutation({
    mutationFn: async (emails: string[]) => {
      const { error } = await supabase
        .from('event_waitlist')
        .update({ notified: true })
        .in('email', emails);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`${selectedEmails.length} personne(s) marquée(s) comme notifiée(s)`);
      queryClient.invalidateQueries({ queryKey: ['event-waitlist'] });
      queryClient.invalidateQueries({ queryKey: ['waitlist-stats'] });
      onSelectionChange([]);
    },
    onError: (error) => {
      console.error('Error marking as notified:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  });

  const deleteEntriesMutation = useMutation({
    mutationFn: async (emails: string[]) => {
      const { error } = await supabase
        .from('event_waitlist')
        .delete()
        .in('email', emails);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`${selectedEmails.length} inscription(s) supprimée(s)`);
      queryClient.invalidateQueries({ queryKey: ['event-waitlist'] });
      queryClient.invalidateQueries({ queryKey: ['waitlist-stats'] });
      onSelectionChange([]);
      setShowDeleteDialog(false);
    },
    onError: (error) => {
      console.error('Error deleting entries:', error);
      toast.error('Erreur lors de la suppression');
    }
  });

  const exportData = async (format: 'csv' | 'json') => {
    try {
      const { data, error } = await supabase
        .from('event_waitlist')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      let content: string;
      let mimeType: string;
      let fileName: string;

      if (format === 'csv') {
        const headers = ['Email', 'Nom complet', 'Pseudonyme', 'Genre', 'Ville', 'Telegram', 'Date d\'inscription', 'Statut'];
        const rows = data.map(entry => [
          entry.email,
          entry.full_name || '',
          entry.pseudonym || '',
          entry.gender || '',
          entry.city || '',
          entry.telegram_username || '',
          new Date(entry.created_at).toLocaleString('fr-FR'),
          entry.notified ? 'Notifié' : 'En attente'
        ]);

        content = [headers, ...rows]
          .map(row => row.map(cell => `"${cell}"`).join(','))
          .join('\n');
        
        mimeType = 'text/csv';
        fileName = `liste-attente-${new Date().toISOString().split('T')[0]}.csv`;
      } else {
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
        fileName = `liste-attente-${new Date().toISOString().split('T')[0]}.json`;
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Export ${format.toUpperCase()} généré avec succès`);
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Erreur lors de l\'export des données');
    }
  };

  const handleEmailSuccess = () => {
    onSelectionChange([]);
    queryClient.invalidateQueries({ queryKey: ['event-waitlist'] });
    queryClient.invalidateQueries({ queryKey: ['waitlist-detailed-stats'] });
  };

  return (
    <>
      <div className="flex items-center gap-2">
        {selectedEmails.length > 0 && (
          <>
            <Button 
              onClick={() => setShowEmailModal(true)}
              disabled={selectedEmails.length === 0}
              variant="default"
              size="sm"
            >
              <Send className="h-4 w-4 mr-2" />
              Envoyer notification ({selectedEmails.length})
            </Button>

            <Button
              onClick={() => markAsNotifiedMutation.mutate(selectedEmails)}
              disabled={markAsNotifiedMutation.isPending}
              size="sm"
              variant="outline"
            >
              <Check className="h-4 w-4 mr-2" />
              Marquer notifié ({selectedEmails.length})
            </Button>
            
            <Button
              onClick={() => setShowDeleteDialog(true)}
              disabled={deleteEntriesMutation.isPending}
              size="sm"
              variant="destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer ({selectedEmails.length})
            </Button>
          </>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <MoreHorizontal className="h-4 w-4 mr-2" />
              Actions
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => exportData('csv')}>
              <Download className="h-4 w-4 mr-2" />
              Exporter en CSV
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => exportData('json')}>
              <Download className="h-4 w-4 mr-2" />
              Exporter en JSON
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => setShowEmailModal(true)}
              disabled={selectedEmails.length === 0}
            >
              <Mail className="h-4 w-4 mr-2" />
              Envoyer notification
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer {selectedEmails.length} inscription(s) ? 
              Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteEntriesMutation.mutate(selectedEmails)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {showEmailModal && (
        <EmailNotificationModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          selectedEmails={selectedEmails}
          onSuccess={handleEmailSuccess}
        />
      )}
    </>
  );
};

export default WaitlistActions;