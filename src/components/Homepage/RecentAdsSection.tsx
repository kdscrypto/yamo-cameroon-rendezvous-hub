
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

export default RecentAdsSection;
