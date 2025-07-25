
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
      <section className="py-8 sm:py-12 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <span className="animate-bounce-gentle">{emoji}</span>
              Hot à {displayName}
            </h2>
            <Button 
              asChild
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0"
            >
              <Link to={`/browse?location=${city}`}>
                <span className="hidden sm:inline">Voir toutes les annonces {displayName}</span>
                <span className="sm:hidden">Voir {displayName}</span>
              </Link>
            </Button>
          </div>
          <div className="text-center py-6 sm:py-8">
            <p className="text-muted-foreground text-sm sm:text-base mb-4">
              Aucune annonce trouvée pour {displayName} pour le moment.
            </p>
            <Button asChild className="text-sm sm:text-base">
              <Link to="/create-ad">Publier une annonce</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 sm:py-12 px-4 bg-card/30">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <span className="animate-bounce-gentle">{emoji}</span>
            Hot à {displayName}
          </h2>
          <Button 
            asChild
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0"
          >
            <Link to={`/browse?location=${city}`}>
              <span className="hidden sm:inline">Voir toutes les annonces {displayName}</span>
              <span className="sm:hidden">Voir {displayName}</span>
            </Link>
          </Button>
        </div>
        <AdGrid 
          ads={locationAds} 
          maxItems={6} 
          seeMoreHref={`/browse?location=${city}`}
          seeMoreText={`Voir plus à ${displayName}`}
        />
      </div>
    </section>
  );
});

LocationAdsSection.displayName = 'LocationAdsSection';

export default LocationAdsSection;
