import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AgeVerification from '@/components/AgeVerification';
import HeroSection from '@/components/Homepage/HeroSection';
import CategoriesSection from '@/components/Homepage/CategoriesSection';
import OptimizedAdSections from '@/components/Homepage/OptimizedAdSections';
import SafetySection from '@/components/Homepage/SafetySection';
import AdsterraWrapper from '@/components/AdsterraWrapper';
import AdsterraVerification from '@/components/ads/AdsterraVerification';
import AdContainer from '@/components/ads/AdContainer';
import AdsterraDebugPanel from '@/components/ads/AdsterraDebugPanel';
import SEO from '@/components/SEO';
import { useSEO } from '@/hooks/useSEO';
import { useAdsterra } from '@/hooks/useAdsterra';
import { useAdsterraDimensionsFix } from '@/hooks/useAdsterraDimensionsFix';

const Index = React.memo(() => {
  const [ageVerified, setAgeVerified] = useState(false);
  const { getSEOForPath } = useSEO();
  const { refreshAds: refreshAdsterra } = useAdsterra();
  
  // Hook pour corriger automatiquement les dimensions des bannières
  useAdsterraDimensionsFix();

  // Check age verification with enhanced security
  useEffect(() => {
    console.log('Index: Checking age verification status');
    
    // Check sessionStorage instead of localStorage
    const verified = sessionStorage.getItem('ageVerified');
    const timestamp = sessionStorage.getItem('ageVerifiedTimestamp');
    
    if (verified === 'true' && timestamp) {
      const verificationTime = parseInt(timestamp);
      const currentTime = Date.now();
      const hoursSinceVerification = (currentTime - verificationTime) / (1000 * 60 * 60);
      
      // Expire verification after 24 hours for additional security
      if (hoursSinceVerification > 24) {
        console.log('Index: Age verification expired (>24h), requiring re-verification');
        sessionStorage.removeItem('ageVerified');
        sessionStorage.removeItem('ageVerifiedTimestamp');
        setAgeVerified(false);
      } else {
        console.log('Index: Valid age verification found, proceeding to main content');
        setAgeVerified(true);
      }
    } else {
      console.log('Index: No valid age verification found, showing verification page');
      setAgeVerified(false);
    }
  }, []);

  const handleAgeVerification = React.useCallback(() => {
    console.log('Index: Age verification completed, showing main content');
    setAgeVerified(true);
    // Refresh ads after age verification
    setTimeout(() => {
      refreshAdsterra();
    }, 1000);
  }, [refreshAdsterra]);

  const seoConfig = getSEOForPath('/');

  // If age not verified, show verification page
  if (!ageVerified) {
    return (
      <>
        <SEO 
          title="Vérification d'âge - Yamo"
          description="Yamo est une plateforme réservée aux adultes de plus de 18 ans. Veuillez confirmer votre âge pour continuer."
          keywords="vérification âge, adultes, 18 ans, Yamo"
        />
        <AgeVerification onConfirm={handleAgeVerification} />
      </>
    );
  }

  return (
    <>
      <SEO 
        title={seoConfig.title}
        description={seoConfig.description}
        keywords={seoConfig.keywords}
        type="website"
        url="/"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <HeroSection />
        
        {/* Bannière principale optimisée - Positionnement premium après hero */}
        <section className="py-6 bg-gradient-to-r from-background/50 to-accent/5">
          <div className="container mx-auto px-4 flex justify-center">
            <AdContainer variant="premium" title="Annonces premium">
              <AdsterraWrapper slot="BANNER_728x90" />
            </AdContainer>
          </div>
        </section>
        
        <CategoriesSection />
        
        {/* Bannière rectangulaire au centre - Zone haute visibilité */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
              <div>
                <OptimizedAdSections />
              </div>
              <aside className="lg:ml-auto lg:mr-4">
                <div className="sticky top-20 space-y-6 w-[300px]">
                  <AdContainer variant="sidebar" title="Annonces sponsorisées">
                    <AdsterraWrapper slot="SIDEBAR_RECTANGLE" />
                  </AdContainer>
                  <AdContainer variant="sidebar">
                    <AdsterraWrapper slot="CONTENT_RECTANGLE" />
                  </AdContainer>
                </div>
              </aside>
            </div>
          </div>
        </section>
        
        <SafetySection />
        
        {/* Bannière footer - Dernière chance de conversion */}
        <section className="py-6 border-t border-border/20 bg-muted/30">
          <div className="container mx-auto px-4 flex justify-center">
            <AdContainer variant="bordered" title="Dernières annonces">
              <AdsterraWrapper slot="FOOTER_BANNER" />
            </AdContainer>
          </div>
        </section>
        
        <Footer />
        
        {/* Bannière mobile sticky en bas - Optimisée pour mobile */}
        <div className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-background/95 backdrop-blur-sm border-t border-border/20 p-2">
          <div className="flex justify-center">
            <AdsterraWrapper slot="MOBILE_BANNER" />
          </div>
        </div>
        
        <AdsterraVerification />
        <AdsterraDebugPanel />
      </div>
    </>
  );
});

Index.displayName = 'Index';

export default Index;
