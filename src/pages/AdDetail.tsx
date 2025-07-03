
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, MapPin, Calendar, Phone, MessageSquare, Star, User } from 'lucide-react';
import SEO from '@/components/SEO';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const AdDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: ad, isLoading, error } = useQuery({
    queryKey: ['ad-detail', id],
    queryFn: async () => {
      if (!id) throw new Error('No ad ID provided');
      
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('id', id)
        .eq('moderation_status', 'approved')
        .eq('status', 'active')
        .single();

      if (error) {
        console.error('Error fetching ad detail:', error);
        throw error;
      }

      return data;
    },
    enabled: !!id,
  });

  // Query to get contact information only if user is authenticated
  const { data: contactInfo } = useQuery({
    queryKey: ['ad-contact', id],
    queryFn: async () => {
      if (!id || !user) return null;
      
      // For now, we'll return the ad data since contact info isn't in a separate table
      // In a real app, you might have a separate contacts table
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id && !!user,
  });

  const getCategoryDisplay = (category: string) => {
    const categories: { [key: string]: string } = {
      'rencontres': 'Rencontres',
      'massages': 'Massages',
      'produits': 'Produits adultes'
    };
    return categories[category] || category;
  };

  const getLocationDisplay = (location: string) => {
    const locations: { [key: string]: string } = {
      'douala': 'Douala',
      'yaounde': 'Yaoundé',
      'bafoussam': 'Bafoussam',
      'bamenda': 'Bamenda',
      'garoua': 'Garoua',
      'maroua': 'Maroua',
      'ngaoundere': 'Ngaoundéré',
      'bertoua': 'Bertoua',
      'ebolowa': 'Ebolowa',
      'kribi': 'Kribi',
      'limbe': 'Limbé',
      'buea': 'Buea',
      'edea': 'Edéa',
      'kumba': 'Kumba',
      'sangmelima': 'Sangmélima'
    };
    return locations[location] || location;
  };

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

    // For demo purposes, we'll use placeholder phone numbers
    // In a real app, these would come from the database
    const phoneNumber = "+237612345678"; // This should come from contactInfo
    const whatsappNumber = "+237612345678"; // This should come from contactInfo

    switch (action) {
      case 'call':
        window.location.href = `tel:${phoneNumber}`;
        toast({
          title: "Appel en cours",
          description: "Redirection vers l'application d'appel...",
        });
        break;
      
      case 'whatsapp':
        const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=Bonjour, je suis intéressé(e) par votre annonce "${ad?.title}"`;
        window.open(whatsappUrl, '_blank');
        toast({
          title: "WhatsApp",
          description: "Redirection vers WhatsApp...",
        });
        break;
      
      case 'message':
        // For now, we'll just show a toast. In a real app, this would open a messaging interface
        toast({
          title: "Message privé",
          description: "Fonctionnalité de messagerie en cours de développement.",
        });
        break;
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement de l'annonce...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !ad) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <h1 className="text-2xl font-bold mb-4">Annonce introuvable</h1>
            <p className="text-muted-foreground mb-6">
              Cette annonce n'existe pas ou n'est plus disponible.
            </p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour à l'accueil
            </Button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const isVip = ad.expires_at && new Date(ad.expires_at) > new Date();

  return (
    <>
      <SEO 
        title={`${ad.title} - Yamo`}
        description={ad.description || `Découvrez cette annonce ${getCategoryDisplay(ad.category)} à ${getLocationDisplay(ad.location)}`}
        keywords={`${ad.category}, ${ad.location}, Yamo, annonce, ${ad.title}`}
        type="article"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Back button */}
            <Button 
              variant="outline" 
              className="mb-6"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Image section */}
              <div className="space-y-4">
                <div className="aspect-video bg-muted relative overflow-hidden rounded-lg">
                  {ad.images && ad.images.length > 0 ? (
                    <img 
                      src={ad.images[0]} 
                      alt={ad.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted/20 to-muted/40">
                      <User className="w-16 h-16 text-muted-foreground opacity-50" />
                    </div>
                  )}
                  
                  {isVip && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-bold shadow-lg flex items-center gap-1">
                        <Star className="w-4 h-4 fill-current" />
                        VIP
                      </Badge>
                    </div>
                  )}
                </div>
                
                {ad.images && ad.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {ad.images.slice(1, 5).map((image, index) => (
                      <div key={index} className="aspect-square bg-muted rounded overflow-hidden">
                        <img 
                          src={image} 
                          alt={`${ad.title} - Image ${index + 2}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Details section */}
              <div className="space-y-6">
                <div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline" className="text-primary border-primary/30">
                      {getCategoryDisplay(ad.category)}
                    </Badge>
                    {isVip && (
                      <Badge className="bg-gradient-to-r from-orange-500 to-yellow-500 text-black font-bold">
                        Annonce VIP
                      </Badge>
                    )}
                  </div>
                  
                  <h1 className="text-3xl font-bold mb-4">{ad.title}</h1>
                  
                  <div className="flex items-center gap-4 text-muted-foreground mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {getLocationDisplay(ad.location)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(ad.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>

                  {ad.price && (
                    <div className="text-3xl font-bold text-primary mb-6">
                      {ad.price.toLocaleString()} FCFA
                    </div>
                  )}
                </div>

                {/* Description */}
                <Card>
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Description</h2>
                    <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                      {ad.description || 'Aucune description disponible.'}
                    </p>
                  </CardContent>
                </Card>

                {/* Contact actions */}
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
                        >
                          <Phone className="w-5 h-5 mr-2" />
                          Appeler
                        </Button>
                        
                        <Button 
                          size="lg" 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handleContactAction('whatsapp')}
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
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AdDetail;
