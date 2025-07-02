
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
    <section className="section-spacing container-spacing bg-gradient-to-br from-card/30 via-card/20 to-background border-y border-border/30">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4 animate-fade-in">
          <div className="space-y-2">
            <h2 className="heading-lg text-gradient-luxe flex items-center gap-2 sm:gap-3">
              <span className="animate-pulse-subtle text-lg sm:text-xl">⭐</span>
              <span className="text-xl sm:text-2xl md:text-3xl">Annonces en vedette</span>
            </h2>
            <p className="body-sm sm:body-md opacity-70">Découvrez nos annonces premium</p>
          </div>
          <Button 
            variant="outline" 
            asChild
            className="btn-outline border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 hover:scale-105 text-sm sm:text-base"
          >
            <Link to="/browse?featured=true">
              <span className="hidden sm:inline">Voir toutes les annonces premium</span>
              <span className="sm:hidden">Voir tout</span>
            </Link>
          </Button>
        </div>
        <AdGrid ads={featuredAds} maxItems={6} />
      </div>
    </section>
  );
});

FeaturedAdsSection.displayName = 'FeaturedAdsSection';

export default FeaturedAdsSection;
