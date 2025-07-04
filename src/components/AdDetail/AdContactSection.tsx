
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, MessageSquare } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AdContactSectionProps {
  adTitle: string;
  adId: string;
  adOwnerId: string;
  contactInfo: {
    phone?: string | null;
    whatsapp?: string | null;
  } | null;
}

const AdContactSection = ({ adTitle, adId, adOwnerId, contactInfo }: AdContactSectionProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const createConversationMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Creating conversation between:', user.id, 'and', adOwnerId);
      
      // Vérifier si une conversation existe déjà
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .contains('participants', JSON.stringify([user.id, adOwnerId]))
        .eq('ad_id', adId)
        .single();

      if (existingConversation) {
        console.log('Existing conversation found:', existingConversation.id);
        return existingConversation.id;
      }

      // Créer une nouvelle conversation
      const { data: newConversation, error } = await supabase
        .from('conversations')
        .insert({
          participants: [user.id, adOwnerId],
          ad_id: adId
        })
        .select('id')
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        throw error;
      }
      
      console.log('New conversation created:', newConversation.id);
      return newConversation.id;
    },
    onSuccess: (conversationId) => {
      console.log('Navigating to conversation:', conversationId);
      navigate(`/dashboard?conversation=${conversationId}`);
    },
    onError: (error) => {
      console.error('Error creating conversation:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer la conversation.",
        variant: "destructive",
      });
    }
  });

  const handleContactAction = (action: 'call' | 'whatsapp' | 'message') => {
    console.log('Contact action triggered:', action);
    
    if (!user) {
      console.log('User not authenticated, redirecting to login');
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour contacter l'annonceur.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    // Pour la messagerie privée, pas besoin de numéro de téléphone
    if (action === 'message') {
      if (user.id === adOwnerId) {
        toast({
          title: "Erreur",
          description: "Vous ne pouvez pas vous envoyer un message à vous-même.",
          variant: "destructive",
        });
        return;
      }
      console.log('Starting private message conversation');
      createConversationMutation.mutate();
      return;
    }

    // Pour les autres actions, vérifier les informations de contact
    if (!contactInfo) {
      console.log('No contact info available');
      toast({
        title: "Erreur",
        description: "Impossible de charger les informations de contact.",
        variant: "destructive",
      });
      return;
    }

    const phoneNumber = contactInfo.phone;
    const whatsappNumber = contactInfo.whatsapp || contactInfo.phone;

    console.log('Contact info:', { phoneNumber, whatsappNumber });

    if (!phoneNumber && action === 'call') {
      toast({
        title: "Erreur",
        description: "Aucun numéro de téléphone disponible.",
        variant: "destructive",
      });
      return;
    }

    switch (action) {
      case 'call':
        console.log('Initiating phone call to:', phoneNumber);
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
        console.log('Opening WhatsApp with:', whatsappNumber);
        const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=Bonjour, je suis intéressé(e) par votre annonce "${adTitle}"`;
        window.open(whatsappUrl, '_blank');
        toast({
          title: "WhatsApp",
          description: "Redirection vers WhatsApp...",
        });
        break;
    }
  };

  return (
    <Card className="bg-card/50 border-border/50">
      <CardContent className="p-6">
        <h2 className="text-xl font-semibold mb-4 text-yellow-400">Contacter</h2>
        {!user ? (
          <div className="text-center py-8">
            <p className="text-white mb-4">
              Vous devez être connecté pour contacter l'annonceur.
            </p>
            <Button onClick={() => navigate('/login')} className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-semibold">
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
              className="w-full border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
              onClick={() => handleContactAction('whatsapp')}
              disabled={!contactInfo?.phone && !contactInfo?.whatsapp}
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              WhatsApp
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full border-yellow-500 text-yellow-400 hover:bg-yellow-500/10"
              onClick={() => handleContactAction('message')}
              disabled={createConversationMutation.isPending || user.id === adOwnerId}
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              {createConversationMutation.isPending ? 'Création...' : 'Message privé'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdContactSection;
