
import React, { useState, useEffect } from 'react';
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
import AdsterraWrapper from '@/components/AdsterraWrapper';
import AdContainer from '@/components/ads/AdContainer';
import AdsterraVerification from '@/components/ads/AdsterraVerification';
import { shouldShowAdsterraAd } from '@/config/adsterraConfig';
import SimilarAds from '@/components/SimilarAds';
import StarRating from '@/components/StarRating';
import { useSimilarAds } from '@/hooks/useSimilarAds';

const AdDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // État local pour les statistiques de notation
  const [currentRating, setCurrentRating] = useState<number>(0);
  const [currentRatingCount, setCurrentRatingCount] = useState<number>(0);

  const { data: ad, isLoading, error } = useQuery({
    queryKey: ['ad-detail', id],
    queryFn: async () => {
      if (!id) {
        console.error('No ad ID provided in URL params');
        throw new Error('No ad ID provided');
      }
      
      console.log('Fetching ad detail for ID:', id);
      
      const { data, error } = await supabase
        .from('ads')
        .select('*')
        .eq('id', id)
        .eq('moderation_status', 'approved')
        .eq('status', 'active')
        .maybeSingle();

      if (error) {
        console.error('Error fetching ad detail:', error);
        throw error;
      }

      if (!data) {
        console.warn('Ad not found or not approved:', id);
        throw new Error('Ad not found or not available');
      }

      console.log('Ad detail fetched successfully:', data.title);
      return data;
    },
    enabled: !!id,
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  // Initialiser les statistiques de notation quand l'annonce est chargée
  useEffect(() => {
    if (ad) {
      setCurrentRating(parseFloat(String(ad.average_rating)) || 0);
      setCurrentRatingCount(ad.rating_count || 0);
    }
  }, [ad]);

  // Fonction pour mettre à jour les statistiques de notation
  const handleRatingUpdate = (averageRating: number, ratingCount: number) => {
    setCurrentRating(averageRating);
    setCurrentRatingCount(ratingCount);
  };

  // Query to get contact information only if user is authenticated
  const { data: contactInfo } = useQuery({
    queryKey: ['ad-contact', id],
    queryFn: async () => {
      if (!id || !user) return null;
      
      console.log('Fetching contact info for ad:', id);
      
      const { data, error } = await supabase
        .from('ads')
        .select('phone, whatsapp')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching contact info:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!id && !!user,
    retry: 1,
  });

  // Query to get similar ads
  const { data: similarAds, isLoading: isLoadingSimilarAds } = useSimilarAds({
    currentAdId: ad?.id || '',
    category: ad?.category || '',
    location: ad?.location || ''
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

  if (error || (!isLoading && !ad)) {
    console.error('Ad not found or error occurred:', { error, ad, id });
    
    return (
      <>
        <SEO 
          title="Annonce introuvable - Yamo"
          description="Cette annonce n'existe pas ou n'est plus disponible."
        />
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <h1 className="text-2xl font-bold mb-4">Annonce introuvable</h1>
            <p className="text-muted-foreground mb-6">
              {error?.message || "Cette annonce n'existe pas ou n'est plus disponible."}
            </p>
            <div className="space-y-3">
              <Button onClick={() => navigate('/')} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour à l'accueil
              </Button>
              <Button variant="outline" onClick={() => window.location.reload()} className="w-full">
                Actualiser la page
              </Button>
            </div>
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
              className="mb-6 border-2 border-primary/20 hover:border-primary hover:bg-primary/5 backdrop-blur-sm bg-background/80 shadow-lg"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Image section */}
              <div className="lg:col-span-2">
                <AdImageGallery 
                  images={ad.images}
                  title={ad.title}
                  isVip={isVip}
                />
              </div>

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
                  adId={ad.id}
                  averageRating={currentRating}
                  ratingCount={currentRatingCount}
                  onRatingUpdate={handleRatingUpdate}
                />

                {/* Contact actions */}
                <AdContactSection
                  adTitle={ad.title}
                  adId={ad.id}
                  adOwnerId={ad.user_id}
                  contactInfo={contactInfo}
                />
              </div>
            </div>

            {/* Content Ad Section - According to PLACEMENTS.AD_DETAIL.content */}
            {shouldShowAdsterraAd('AD_DETAIL', 'content') && (
              <div className="mt-12">
                <AdContainer title="Publicité" variant="subtle">
                  <div className="flex justify-center">
                    <AdsterraWrapper slot="CONTENT_RECTANGLE" />
                  </div>
                </AdContainer>
              </div>
            )}

            {/* Similar Ads Section */}
            {(similarAds && similarAds.length > 0) && (
              <div className="mt-8">
                <SimilarAds ads={similarAds} isLoading={isLoadingSimilarAds} />
              </div>
            )}
          </div>
        </main>

        <Footer />
        <AdsterraVerification />
      </div>
    </>
  );
};

export default AdDetail;
