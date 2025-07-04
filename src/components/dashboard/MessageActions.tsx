
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Star, Flag, Archive, Trash2, MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface MessageActionsProps {
  messageId: string;
  isFavorite?: boolean;
  isImportant?: boolean;
  isArchived?: boolean;
  onFavoriteToggle?: (messageId: string, isFavorite: boolean) => void;
  onImportantToggle?: (messageId: string, isImportant: boolean) => void;
  onArchive?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
}

const MessageActions = ({
  messageId,
  isFavorite = false,
  isImportant = false,
  isArchived = false,
  onFavoriteToggle,
  onImportantToggle,
  onArchive,
  onDelete
}: MessageActionsProps) => {
  const [loading, setLoading] = useState(false);

  const handleFavoriteToggle = async () => {
    setLoading(true);
    try {
      onFavoriteToggle?.(messageId, !isFavorite);
      toast.success(isFavorite ? 'Retiré des favoris' : 'Ajouté aux favoris');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleImportantToggle = async () => {
    setLoading(true);
    try {
      onImportantToggle?.(messageId, !isImportant);
      toast.success(isImportant ? 'Marqué comme normal' : 'Marqué comme important');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setLoading(false);
    }
  };

  const handleArchive = async () => {
    setLoading(true);
    try {
      onArchive?.(messageId);
      toast.success('Message archivé');
    } catch (error) {
      toast.error('Erreur lors de l\'archivage');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      setLoading(true);
      try {
        onDelete?.(messageId);
        toast.success('Message supprimé');
      } catch (error) {
        toast.error('Erreur lors de la suppression');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" disabled={loading}>
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleFavoriteToggle}>
          <Star className={`w-4 h-4 mr-2 ${isFavorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
          {isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleImportantToggle}>
          <Flag className={`w-4 h-4 mr-2 ${isImportant ? 'fill-red-400 text-red-400' : ''}`} />
          {isImportant ? 'Marquer normal' : 'Marquer important'}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {!isArchived && (
          <DropdownMenuItem onClick={handleArchive}>
            <Archive className="w-4 h-4 mr-2" />
            Archiver
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={handleDelete} className="text-destructive">
          <Trash2 className="w-4 h-4 mr-2" />
          Supprimer
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MessageActions;
