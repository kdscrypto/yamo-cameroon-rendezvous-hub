
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import AdCarousel from './AdCarousel';
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
    <section className="section-spacing container-spacing py-16">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4 animate-fade-in">
          <div className="space-y-2">
            <h2 className="text-yellow-400 text-xl sm:text-2xl md:text-3xl font-bold">Annonces récentes</h2>
            <p className="text-yellow-500 text-sm sm:text-base opacity-70">Les dernières opportunités disponibles</p>
          </div>
          <Button 
            asChild
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0"
          >
            <Link to="/browse">
              <span className="hidden sm:inline">Voir toutes les annonces</span>
              <span className="sm:hidden">Voir tout</span>
            </Link>
          </Button>
        </div>
        <AdCarousel 
          ads={recentAds} 
          maxItems={12} 
          seeMoreHref="/browse"
          seeMoreText="Voir plus d'annonces récentes"
        />
      </div>
    </section>
  );
});

RecentAdsSection.displayName = 'RecentAdsSection';

export default RecentAdsSection;
