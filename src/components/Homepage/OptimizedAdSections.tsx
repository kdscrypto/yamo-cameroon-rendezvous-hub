
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useOptimizedApprovedAds } from '@/hooks/useOptimizedAds';
import FeaturedAdsSection from './FeaturedAdsSection';
import RecentAdsSection from './RecentAdsSection';
import LocationAdsSection from './LocationAdsSection';

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
