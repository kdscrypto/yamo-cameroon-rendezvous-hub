
import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface ComposeMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onMessageSent: () => void;
}

interface Ad {
  id: string;
  title: string;
  user_id: string;
}

const ComposeMessageModal = ({ isOpen, onClose, onMessageSent }: ComposeMessageModalProps) => {
  const { user } = useAuth();
  const [selectedAd, setSelectedAd] = useState<string>('');
  const [recipientId, setRecipientId] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [content, setContent] = useState<string>('');

  // Fetch available ads to message about
  const { data: ads } = useQuery({
    queryKey: ['available-ads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ads')
        .select('id, title, user_id')
        .eq('status', 'active')
        .eq('moderation_status', 'approved')
        .neq('user_id', user?.id || ''); // Don't show user's own ads
      
      if (error) {
        console.error('Error fetching ads:', error);
        return [];
      }
      
      return data as Ad[];
    },
    enabled: !!user && isOpen
  });

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      let finalRecipientId = recipientId;
      let adId = selectedAd || null;

      // If an ad is selected, get the ad owner as recipient
      if (selectedAd) {
        const selectedAdData = ads?.find(ad => ad.id === selectedAd);
        if (selectedAdData) {
          finalRecipientId = selectedAdData.user_id;
        }
      }

      if (!finalRecipientId) {
        throw new Error('Recipient not specified');
      }

      if (!content.trim()) {
        throw new Error('Message content is required');
      }

      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .contains('participants', JSON.stringify([user.id, finalRecipientId]))
        .eq('ad_id', adId)
        .single();

      let conversationId = existingConversation?.id;

      // Create conversation if it doesn't exist
      if (!conversationId) {
        const { data: newConversation, error: convError } = await supabase
          .from('conversations')
          .insert({
            participants: [user.id, finalRecipientId],
            ad_id: adId
          })
          .select('id')
          .single();

        if (convError) throw convError;
        conversationId = newConversation.id;
      }

      // Send the message
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          recipient_id: finalRecipientId,
          conversation_id: conversationId,
          ad_id: adId,
          subject: subject.trim() || null,
          content: content.trim()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast.success('Message envoyé avec succès');
      setSelectedAd('');
      setRecipientId('');
      setSubject('');
      setContent('');
      onMessageSent();
      onClose();
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast.error('Erreur lors de l\'envoi du message');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessageMutation.mutate();
  };

  const handleAdSelect = (adId: string) => {
    setSelectedAd(adId);
    const ad = ads?.find(a => a.id === adId);
    if (ad) {
      setSubject(`Re: ${ad.title}`);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Nouveau message</DialogTitle>
          <DialogDescription>
            Envoyez un message à propos d'une annonce ou directement à un utilisateur.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Ad Selection */}
          <div className="space-y-2">
            <Label htmlFor="ad-select">Annonce (optionnel)</Label>
            <Select value={selectedAd} onValueChange={handleAdSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner une annonce..." />
              </SelectTrigger>
              <SelectContent>
                {ads?.map((ad) => (
                  <SelectItem key={ad.id} value={ad.id}>
                    {ad.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Manual Recipient ID (if no ad selected) */}
          {!selectedAd && (
            <div className="space-y-2">
              <Label htmlFor="recipient">ID du destinataire</Label>
              <Input
                id="recipient"
                value={recipientId}
                onChange={(e) => setRecipientId(e.target.value)}
                placeholder="Entrez l'ID de l'utilisateur..."
                required={!selectedAd}
              />
            </div>
          )}

          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">Sujet (optionnel)</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Sujet du message..."
            />
          </div>

          {/* Message Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Message *</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tapez votre message ici..."
              required
              className="min-h-[120px]"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button 
              type="submit" 
              disabled={sendMessageMutation.isPending || (!selectedAd && !recipientId) || !content.trim()}
            >
              {sendMessageMutation.isPending ? 'Envoi...' : 'Envoyer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ComposeMessageModal;
