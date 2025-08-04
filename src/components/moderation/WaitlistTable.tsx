
import { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Mail, Trash2, Check } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface WaitlistEntry {
  id: string;
  email: string;
  full_name: string | null;
  pseudonym: string | null;
  gender: string | null;
  city: string | null;
  telegram_username: string | null;
  created_at: string;
  notified: boolean;
}

interface WaitlistTableProps {
  entries: WaitlistEntry[];
  selectedEmails: string[];
  onSelectionChange: (emails: string[]) => void;
  onMarkAsNotified: (email: string) => void;
  onDelete: (email: string) => void;
}

const WaitlistTable = ({
  entries,
  selectedEmails,
  onSelectionChange,
  onMarkAsNotified,
  onDelete
}: WaitlistTableProps) => {
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange(entries.map(entry => entry.email));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectEntry = (email: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedEmails, email]);
    } else {
      onSelectionChange(selectedEmails.filter(e => e !== email));
    }
  };

  const isAllSelected = entries.length > 0 && selectedEmails.length === entries.length;
  const isPartiallySelected = selectedEmails.length > 0 && selectedEmails.length < entries.length;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={isAllSelected}
              onCheckedChange={handleSelectAll}
              className={isPartiallySelected ? "data-[state=checked]:bg-primary/50" : ""}
            />
          </TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Nom / Pseudonyme</TableHead>
          <TableHead>Genre</TableHead>
          <TableHead>Ville</TableHead>
          <TableHead>Telegram</TableHead>
          <TableHead>Date d'inscription</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead className="w-12"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {entries.map((entry) => (
          <TableRow key={entry.id}>
            <TableCell>
              <Checkbox
                checked={selectedEmails.includes(entry.email)}
                onCheckedChange={(checked) => handleSelectEntry(entry.email, !!checked)}
              />
            </TableCell>
            <TableCell className="font-medium">{entry.email}</TableCell>
            <TableCell>
              <div className="space-y-1">
                <div className="font-medium">{entry.full_name || '-'}</div>
                {entry.pseudonym && (
                  <div className="text-sm text-muted-foreground">@{entry.pseudonym}</div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant="outline" className="text-xs">
                {entry.gender || '-'}
              </Badge>
            </TableCell>
            <TableCell>{entry.city || '-'}</TableCell>
            <TableCell>
              {entry.telegram_username ? (
                <span className="text-sm">@{entry.telegram_username}</span>
              ) : (
                '-'
              )}
            </TableCell>
            <TableCell>
              {format(new Date(entry.created_at), 'dd MMM yyyy à HH:mm', { locale: fr })}
            </TableCell>
            <TableCell>
              <Badge variant={entry.notified ? "default" : "secondary"}>
                {entry.notified ? 'Notifié' : 'En attente'}
              </Badge>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {!entry.notified && (
                    <DropdownMenuItem onClick={() => onMarkAsNotified(entry.email)}>
                      <Check className="h-4 w-4 mr-2" />
                      Marquer comme notifié
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>
                    <Mail className="h-4 w-4 mr-2" />
                    Envoyer notification
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(entry.email)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default WaitlistTable;
