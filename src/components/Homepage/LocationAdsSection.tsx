
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import AdGrid from './AdGrid';
import { useOptimizedApprovedAds } from '@/hooks/useOptimizedAds';

interface LocationAdsSectionProps {
  city: string;
  displayName: string;
  emoji: string;
}

const LocationAdsSection = React.memo(({ 
  city, 
  displayName, 
  emoji 
}: LocationAdsSectionProps) => {
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

export default LocationAdsSection;
