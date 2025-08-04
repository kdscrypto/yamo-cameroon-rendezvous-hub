import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Mail, Users, Calendar, MapPin, Send, Eye, X, Edit } from 'lucide-react';
import { toast } from 'sonner';

interface EmailNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedEmails: string[];
  onSuccess: () => void;
}

type EmailTemplate = 'event_launch' | 'general_update' | 'custom';

const EmailNotificationModal = ({
  isOpen,
  onClose,
  selectedEmails,
  onSuccess
}: EmailNotificationModalProps) => {
  const [subject, setSubject] = useState('');
  const [template, setTemplate] = useState<EmailTemplate>('event_launch');
  const [customContent, setCustomContent] = useState('');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const sendNotificationMutation = useMutation({
    mutationFn: async () => {
      // Pour notre nouvelle fonction, nous envoyons un email à la fois
      const results = [];
      for (const email of selectedEmails) {
        const { data, error } = await supabase.functions.invoke('send-waiting-list-notification-v2', {
          body: {
            email,
            name: email.split('@')[0] // Utiliser la partie avant @ comme nom par défaut
          }
        });

        if (error) throw error;
        results.push(data);
      }
      return results;
    },
    onSuccess: (data) => {
      console.log('Notifications sent successfully:', data);
      toast.success(`${selectedEmails.length} notifications envoyées avec succès`);
      onSuccess();
      onClose();
      resetForm();
    },
    onError: (error) => {
      console.error('Error sending notifications:', error);
      toast.error('Erreur lors de l\'envoi des notifications');
    }
  });

  const resetForm = () => {
    setSubject('');
    setTemplate('event_launch');
    setCustomContent('');
    setEventName('');
    setEventDate('');
    setEventLocation('');
    setShowPreview(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const getPreviewContent = () => {
    if (template === 'event_launch') {
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🎉 L'événement que vous attendiez est là !</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <h2 style="color: #1f2937; margin-top: 0;">${eventName || 'Événement Spécial'}</h2>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Nous sommes ravis de vous annoncer que l'événement pour lequel vous vous êtes inscrit(e) 
              sur notre liste d'attente est maintenant disponible !
            </p>
            
            ${eventDate ? `<p style="color: #374151;"><strong>📅 Date :</strong> ${eventDate}</p>` : ''}
            ${eventLocation ? `<p style="color: #374151;"><strong>📍 Lieu :</strong> ${eventLocation}</p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background: #fbbf24; color: black; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px; display: inline-block;">
              Voir l'événement
            </a>
          </div>
        </div>
      `;
    } else if (template === 'general_update') {
      return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">📢 Mise à jour importante</h1>
          </div>
          
          <div style="background: #f9fafb; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Nous avons des nouvelles importantes à partager avec vous concernant nos événements à venir.
            </p>
            <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
              Restez connecté(e) pour ne rien manquer de nos prochaines annonces !
            </p>
          </div>
        </div>
      `;
    } else {
      return customContent || 'Contenu personnalisé...';
    }
  };

  const handleTemplateChange = (value: EmailTemplate) => {
    setTemplate(value);
    
    // Set default subject based on template
    if (value === 'event_launch') {
      setSubject('🎉 Votre événement est maintenant disponible !');
    } else if (value === 'general_update') {
      setSubject('📢 Mise à jour importante - Événements');
    } else {
      setSubject('');
    }
  };

  if (showPreview) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Aperçu de l'email
            </DialogTitle>
            <DialogDescription>
              Aperçu du message qui sera envoyé à {selectedEmails.length} destinataire{selectedEmails.length > 1 ? 's' : ''}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Objet</Label>
              <div className="p-3 bg-muted rounded-md">{subject}</div>
            </div>
            
            <Separator />
            
            <ScrollArea className="h-[400px] border rounded-md">
              <div 
                className="p-4"
                dangerouslySetInnerHTML={{ __html: getPreviewContent() }}
              />
            </ScrollArea>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              <X className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <Button 
              onClick={() => sendNotificationMutation.mutate()}
              disabled={sendNotificationMutation.isPending}
            >
              <Send className="h-4 w-4 mr-2" />
              {sendNotificationMutation.isPending ? 'Envoi en cours...' : 'Envoyer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Envoyer une notification
          </DialogTitle>
          <DialogDescription>
            Créer et envoyer un email à {selectedEmails.length} destinataire{selectedEmails.length > 1 ? 's' : ''}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Recipients */}
            <div>
              <Label className="flex items-center gap-2 mb-2">
                <Users className="h-4 w-4" />
                Destinataires ({selectedEmails.length})
              </Label>
              <div className="max-h-24 overflow-y-auto border rounded-md p-2">
                <div className="flex flex-wrap gap-1">
                  {selectedEmails.map((email) => (
                    <Badge key={email} variant="secondary" className="text-xs">
                      {email}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* Template Selection */}
            <div>
              <Label>Type de notification</Label>
              <Select value={template} onValueChange={handleTemplateChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="event_launch">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Lancement d'événement
                    </div>
                  </SelectItem>
                  <SelectItem value="general_update">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Mise à jour générale
                    </div>
                  </SelectItem>
                  <SelectItem value="custom">
                    <div className="flex items-center gap-2">
                      <Edit className="h-4 w-4" />
                      Contenu personnalisé
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div>
              <Label htmlFor="subject">Objet de l'email</Label>
              <Input
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Entrez l'objet de l'email..."
              />
            </div>

            {/* Event Details (for event_launch template) */}
            {template === 'event_launch' && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="eventName">Nom de l'événement</Label>
                  <Input
                    id="eventName"
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="Ex: Soirée VIP Exclusive"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="eventDate">Date de l'événement</Label>
                    <Input
                      id="eventDate"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      placeholder="Ex: Samedi 15 Mars 2024"
                    />
                  </div>
                  <div>
                    <Label htmlFor="eventLocation" className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Lieu
                    </Label>
                    <Input
                      id="eventLocation"
                      value={eventLocation}
                      onChange={(e) => setEventLocation(e.target.value)}
                      placeholder="Ex: Paris 15ème"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Custom Content */}
            {template === 'custom' && (
              <div>
                <Label htmlFor="customContent">Contenu personnalisé</Label>
                <Textarea
                  id="customContent"
                  value={customContent}
                  onChange={(e) => setCustomContent(e.target.value)}
                  placeholder="Entrez votre message personnalisé (HTML supporté)..."
                  rows={8}
                />
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Annuler
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowPreview(true)}
            disabled={!subject || (template === 'custom' && !customContent)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Aperçu
          </Button>
          <Button 
            onClick={() => sendNotificationMutation.mutate()}
            disabled={sendNotificationMutation.isPending || !subject || (template === 'custom' && !customContent)}
          >
            <Send className="h-4 w-4 mr-2" />
            {sendNotificationMutation.isPending ? 'Envoi...' : 'Envoyer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EmailNotificationModal;