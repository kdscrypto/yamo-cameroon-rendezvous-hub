
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
      <div className="section-spacing container-spacing">
        <div className="container mx-auto text-center animate-fade-in">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h3 className="heading-sm mb-3">Chargement des annonces...</h3>
          <p className="body-md opacity-60">Veuillez patienter pendant que nous récupérons les meilleures annonces pour vous.</p>
        </div>
      </div>
    );
  }

  if (allAds.length === 0) {
    return (
      <section className="section-spacing container-spacing">
        <div className="container mx-auto text-center animate-scale-in">
          <div className="max-w-md mx-auto space-y-6">
            <div className="w-16 h-16 gradient-luxe rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-medium">
              <span className="text-black font-bold text-2xl">📝</span>
            </div>
            <h2 className="heading-lg mb-4">Aucune annonce disponible</h2>
            <p className="body-lg opacity-70 mb-8">
              Il n'y a actuellement aucune annonce approuvée à afficher. 
              Soyez le premier à publier une annonce !
            </p>
            <Button 
              asChild
              className="btn-primary gradient-luxe text-black hover:opacity-90 font-semibold shadow-medium hover:scale-105 transition-all duration-300"
            >
              <Link to="/create-ad">Publier une annonce</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-0">
      <FeaturedAdsSection />
      <RecentAdsSection />
      <LocationAdsSection city="douala" displayName="Douala" emoji="🔥" />
      <LocationAdsSection city="yaounde" displayName="Yaoundé" emoji="🔥" />
    </div>
  );
});

OptimizedAdSections.displayName = 'OptimizedAdSections';

export default OptimizedAdSections;
