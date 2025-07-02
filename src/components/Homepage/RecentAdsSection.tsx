
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import AdGrid from './AdGrid';
import { useOptimizedApprovedAds } from '@/hooks/useOptimizedAds';

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
    <section className="section-spacing container-spacing">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4 animate-fade-in">
          <div className="space-y-2">
            <h2 className="heading-lg text-xl sm:text-2xl md:text-3xl">Annonces récentes</h2>
            <p className="body-sm sm:body-md opacity-70">Les dernières opportunités disponibles</p>
          </div>
          <Button 
            variant="outline" 
            asChild
            className="btn-outline hover:scale-105 transition-all duration-300 text-sm sm:text-base"
          >
            <Link to="/browse">
              <span className="hidden sm:inline">Voir toutes les annonces</span>
              <span className="sm:hidden">Voir tout</span>
            </Link>
          </Button>
        </div>
        <AdGrid ads={recentAds} maxItems={8} />
      </div>
    </section>
  );
});

RecentAdsSection.displayName = 'RecentAdsSection';

export default RecentAdsSection;
