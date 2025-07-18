import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AgeVerification from '@/components/AgeVerification';
import HeroSection from '@/components/Homepage/HeroSection';
import CategoriesSection from '@/components/Homepage/CategoriesSection';
import OptimizedAdSections from '@/components/Homepage/OptimizedAdSections';
import SafetySection from '@/components/Homepage/SafetySection';
import AdBanner from '@/components/ads/AdBanner';
import AdContainer from '@/components/ads/AdContainer';
import SEO from '@/components/SEO';
import { useSEO } from '@/hooks/useSEO';
import { useGoogleAds } from '@/hooks/useGoogleAds';

const Index = React.memo(() => {
  const [ageVerified, setAgeVerified] = useState(false);
  const { getSEOForPath } = useSEO();
  const { refreshAds } = useGoogleAds();

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
    setTimeout(() => refreshAds(), 1000);
  }, [refreshAds]);

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
        
        {/* Header Ad Banner */}
        <AdContainer variant="transparent" title="">
          <AdBanner placement="header" />
        </AdContainer>
        
        <HeroSection />
        <CategoriesSection />
        
        {/* Content Ad between sections */}
        <section className="py-4">
          <div className="container mx-auto px-4">
            <AdContainer variant="subtle">
              <AdBanner placement="content" />
            </AdContainer>
          </div>
        </section>
        
        <OptimizedAdSections />
        <SafetySection />
        <Footer />
      </div>
    </>
  );
});

Index.displayName = 'Index';

export default Index;
