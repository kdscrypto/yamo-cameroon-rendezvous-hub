
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface AdContactSectionProps {
  adTitle: string;
  contactInfo: {
    phone?: string | null;
    whatsapp?: string | null;
  } | null;
}

const AdContactSection = ({ adTitle, contactInfo }: AdContactSectionProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const handleContactAction = (action: 'call' | 'whatsapp' | 'message') => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour accéder aux informations de contact.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (!contactInfo) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les informations de contact.",
        variant: "destructive",
      });
      return;
    }

    const phoneNumber = contactInfo.phone;
    const whatsappNumber = contactInfo.whatsapp || contactInfo.phone;

    if (!phoneNumber) {
      toast({
        title: "Erreur",
        description: "Aucun numéro de téléphone disponible.",
        variant: "destructive",
      });
      return;
    }

    switch (action) {
      case 'call':
        window.location.href = `tel:${phoneNumber}`;
        toast({
          title: "Appel en cours",
          description: "Redirection vers l'application d'appel...",
        });
        break;
      
      case 'whatsapp':
        if (!whatsappNumber) {
          toast({
            title: "Erreur",
            description: "Aucun numéro WhatsApp disponible.",
            variant: "destructive",
          });
          return;
        }
        const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=Bonjour, je suis intéressé(e) par votre annonce "${adTitle}"`;
        window.open(whatsappUrl, '_blank');
        toast({
          title: "WhatsApp",
          description: "Redirection vers WhatsApp...",
        });
        break;
      
      case 'message':
        toast({
          title: "Message privé",
          description: "Fonctionnalité de messagerie en cours de développement.",
        });
        break;
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4">Contacter</h2>
        {!user ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Vous devez être connecté pour accéder aux informations de contact.
            </p>
            <Button onClick={() => navigate('/login')} className="w-full">
              Se connecter
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <Button 
              size="lg" 
              className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-black font-semibold"
              onClick={() => handleContactAction('call')}
              disabled={!contactInfo?.phone}
            >
              <Phone className="w-5 h-5 mr-2" />
              Appeler
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full"
              onClick={() => handleContactAction('whatsapp')}
              disabled={!contactInfo?.phone && !contactInfo?.whatsapp}
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              WhatsApp
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full"
              onClick={() => handleContactAction('message')}
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Message privé
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdContactSection;
