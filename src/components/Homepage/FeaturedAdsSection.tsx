
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import AdGrid from './AdGrid';
import { useOptimizedApprovedAds } from '@/hooks/useOptimizedAds';

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

export default FeaturedAdsSection;
