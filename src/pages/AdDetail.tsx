
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import SEO from '@/components/SEO';
import { useAuth } from '@/hooks/useAuth';
import AdImageGallery from '@/components/AdDetail/AdImageGallery';
import AdInfoSection from '@/components/AdDetail/AdInfoSection';
import AdContactSection from '@/components/AdDetail/AdContactSection';

const AdDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

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
              <AdImageGallery 
                images={ad.images}
                title={ad.title}
                isVip={isVip}
              />

              {/* Details section */}
              <div className="space-y-6">
                <AdInfoSection
                  title={ad.title}
                  category={ad.category}
                  location={ad.location}
                  createdAt={ad.created_at}
                  price={ad.price}
                  description={ad.description}
                  isVip={isVip}
                />

                {/* Contact actions */}
                <AdContactSection
                  adTitle={ad.title}
                  contactInfo={contactInfo}
                />
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
