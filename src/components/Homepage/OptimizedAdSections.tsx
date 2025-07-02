
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import OptimizedAdCard from '@/components/OptimizedAdCard';
import { useOptimizedApprovedAds } from '@/hooks/useOptimizedAds';

// Composant de grille d'annonces avec virtualisation simple
const AdGrid = React.memo(({ ads, maxItems = 6 }: { 
  ads: any[]; 
  maxItems?: number; 
}) => {
  const displayedAds = React.useMemo(() => 
    ads.slice(0, maxItems), 
    [ads, maxItems]
  );

  const convertAdToCardProps = React.useCallback((ad: any) => ({
    id: ad.id,
    title: ad.title,
    description: ad.description || '',
    price: ad.price ? `${ad.price.toLocaleString()} FCFA` : undefined,
    location: ad.location || '',
    category: ad.category,
    imageUrl: ad.images && ad.images.length > 0 ? ad.images[0] : undefined,
    isVip: !!ad.expires_at && new Date(ad.expires_at) > new Date()
  }), []);

  const handleAdClick = React.useCallback((adId: string) => {
    console.log('Ad clicked:', adId);
    // For now, just log - in the future this could navigate to ad detail page
    // navigate(`/ad/${adId}`);
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {displayedAds.map((ad) => (
        <OptimizedAdCard 
          key={ad.id} 
          {...convertAdToCardProps(ad)}
          onClick={() => handleAdClick(ad.id)}
        />
      ))}
    </div>
  );
});

AdGrid.displayName = 'AdGrid';

// Section d'annonces optimisée avec séparation des requêtes
const FeaturedAdsSection = React.memo(() => {
  const { data: allAds = [], isLoading } = useOptimizedApprovedAds();

  const featuredAds = React.useMemo(() => {
    console.log('Processing featured ads from', allAds.length, 'total ads');
    const featured = allAds
      .filter(ad => {
        const hasExpiry = ad.expires_at && new Date(ad.expires_at) > new Date();
        console.log('Ad', ad.id, 'has valid expiry:', hasExpiry, 'expires_at:', ad.expires_at);
        return hasExpiry;
      })
      .slice(0, 6);
    console.log('Featured ads found:', featured.length);
    return featured;
  }, [allAds]);

  if (isLoading || featuredAds.length === 0) {
    console.log('Featured ads section - Loading:', isLoading, 'Ads count:', featuredAds.length);
    return null;
  }

  return (
    <section className="py-12 px-4 bg-card/30">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">⭐ Annonces en vedette</h2>
          <Button variant="outline" asChild>
            <Link to="/browse?featured=true">Voir toutes les annonces premium</Link>
          </Button>
        </div>
        <AdGrid ads={featuredAds} maxItems={6} />
      </div>
    </section>
  );
});

FeaturedAdsSection.displayName = 'FeaturedAdsSection';

const RecentAdsSection = React.memo(() => {
  const { data: allAds = [], isLoading } = useOptimizedApprovedAds();

  const recentAds = React.useMemo(() => {
    console.log('Processing recent ads from', allAds.length, 'total ads');
    const recent = allAds
      .filter(ad => {
        const isNotVip = !ad.expires_at || new Date(ad.expires_at) <= new Date();
        console.log('Ad', ad.id, 'is regular (not VIP):', isNotVip, 'expires_at:', ad.expires_at);
        return isNotVip;
      })
      .slice(0, 8);
    console.log('Recent ads found:', recent.length);
    return recent;
  }, [allAds]);

  if (isLoading || recentAds.length === 0) {
    console.log('Recent ads section - Loading:', isLoading, 'Ads count:', recentAds.length);
    return null;
  }

  return (
    <section className="py-12 px-4">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Annonces récentes</h2>
          <Button variant="outline" asChild>
            <Link to="/browse">Voir toutes les annonces</Link>
          </Button>
        </div>
        <AdGrid ads={recentAds} maxItems={8} />
      </div>
    </section>
  );
});

RecentAdsSection.displayName = 'RecentAdsSection';

const LocationAdsSection = React.memo(({ 
  city, 
  displayName, 
  emoji 
}: { 
  city: string; 
  displayName: string; 
  emoji: string; 
}) => {
  const { data: allAds = [], isLoading } = useOptimizedApprovedAds();

  const locationAds = React.useMemo(() => {
    console.log('Processing location ads for', city, 'from', allAds.length, 'total ads');
    const filtered = allAds.filter(ad => {
      const hasLocation = ad.location && ad.location.toLowerCase().includes(city.toLowerCase());
      console.log('Ad', ad.id, 'location match for', city, ':', hasLocation, 'location:', ad.location);
      return hasLocation;
    });
    console.log('Location ads found for', city, ':', filtered.length);
    return filtered.slice(0, 6);
  }, [allAds, city]);

  if (isLoading) {
    console.log('Location ads section loading for', city);
    return null;
  }

  if (locationAds.length === 0) {
    console.log('No location ads found for', city);
    return (
      <section className="py-12 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">{emoji} Hot à {displayName}</h2>
            <Button variant="outline" asChild>
              <Link to={`/browse?location=${city}`}>
                Voir toutes les annonces {displayName}
              </Link>
            </Button>
          </div>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Aucune annonce trouvée pour {displayName} pour le moment.
            </p>
            <Button asChild className="mt-4">
              <Link to="/create-ad">Publier une annonce</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4 bg-card/30">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">{emoji} Hot à {displayName}</h2>
          <Button variant="outline" asChild>
            <Link to={`/browse?location=${city}`}>
              Voir toutes les annonces {displayName}
            </Link>
          </Button>
        </div>
        <AdGrid ads={locationAds} maxItems={6} />
      </div>
    </section>
  );
});

LocationAdsSection.displayName = 'LocationAdsSection';

const OptimizedAdSections = React.memo(() => {
  const { data: allAds = [], isLoading } = useOptimizedApprovedAds();

  console.log('OptimizedAdSections - Total ads loaded:', allAds.length, 'Loading:', isLoading);

  if (isLoading) {
    return (
      <div className="py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des annonces approuvées...</p>
        </div>
      </div>
    );
  }

  if (allAds.length === 0) {
    return (
      <section className="py-12 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Aucune annonce disponible</h2>
          <p className="text-muted-foreground mb-8">
            Il n'y a actuellement aucune annonce approuvée à afficher.
          </p>
          <Button asChild>
            <Link to="/create-ad">Publier une annonce</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <>
      <FeaturedAdsSection />
      <RecentAdsSection />
      <LocationAdsSection city="douala" displayName="Douala" emoji="🔥" />
      <LocationAdsSection city="yaounde" displayName="Yaoundé" emoji="🔥" />
    </>
  );
});

OptimizedAdSections.displayName = 'OptimizedAdSections';

export default OptimizedAdSections;
