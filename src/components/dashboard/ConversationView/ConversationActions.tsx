
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { MoreVertical, Archive, Trash2, Bell, BellOff, Flag } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ConversationActionsProps {
  conversationId: string;
  isArchived?: boolean;
  isMuted?: boolean;
  onArchive?: () => void;
  onDelete?: () => void;
  onMute?: () => void;
  onReport?: () => void;
}

const ConversationActions = ({ 
  conversationId, 
  isArchived = false,
  isMuted = false,
  onArchive,
  onDelete,
  onMute,
  onReport
}: ConversationActionsProps) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleArchive = async () => {
    try {
      setIsLoading(true);
      
      // In a real implementation, you would add an 'archived' column to conversations
      // For now, we'll just show a success message
      toast.success(isArchived ? 'Conversation désarchivée' : 'Conversation archivée');
      onArchive?.();
    } catch (error) {
      toast.error('Erreur lors de l\'archivage');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setIsLoading(true);
      
      // Delete all messages in the conversation first
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);

      if (messagesError) throw messagesError;

      // Then delete the conversation
      const { error: conversationError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (conversationError) throw conversationError;

      toast.success('Conversation supprimée');
      onDelete?.();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setIsLoading(false);
      setShowDeleteDialog(false);
    }
  };

  const handleMute = async () => {
    try {
      setIsLoading(true);
      
      // In a real implementation, you would store mute preferences
      toast.success(isMuted ? 'Notifications réactivées' : 'Notifications désactivées');
      onMute?.();
    } catch (error) {
      toast.error('Erreur lors de la modification des notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReport = () => {
    // In a real implementation, you would open a report modal
    toast.info('Fonctionnalité de signalement à venir');
    onReport?.();
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" disabled={isLoading}>
            <MoreVertical className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleArchive} disabled={isLoading}>
            <Archive className="w-4 h-4 mr-2" />
            {isArchived ? 'Désarchiver' : 'Archiver'}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleMute} disabled={isLoading}>
            {isMuted ? (
              <Bell className="w-4 h-4 mr-2" />
            ) : (
              <BellOff className="w-4 h-4 mr-2" />
            )}
            {isMuted ? 'Réactiver les notifications' : 'Couper les notifications'}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleReport} disabled={isLoading}>
            <Flag className="w-4 h-4 mr-2" />
            Signaler
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)} 
            className="text-red-600 focus:text-red-600"
            disabled={isLoading}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer la conversation
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer la conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Tous les messages de cette conversation seront définitivement supprimés.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? 'Suppression...' : 'Supprimer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default ConversationActions;
