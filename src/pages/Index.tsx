
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AgeVerification from '@/components/AgeVerification';
import HeroSection from '@/components/Homepage/HeroSection';
import CategoriesSection from '@/components/Homepage/CategoriesSection';
import OptimizedAdSections from '@/components/Homepage/OptimizedAdSections';
import SafetySection from '@/components/Homepage/SafetySection';
import SEO from '@/components/SEO';
import { useSEO } from '@/hooks/useSEO';

const Index = React.memo(() => {
  const [ageVerified, setAgeVerified] = useState(false);
  const { getSEOForPath } = useSEO();

  // Vérifier si l'utilisateur a déjà confirmé son âge
  useEffect(() => {
    const verified = localStorage.getItem('ageVerified');
    if (verified === 'true') {
      setAgeVerified(true);
    }
  }, []);

  const handleAgeVerification = React.useCallback(() => {
    localStorage.setItem('ageVerified', 'true');
    setAgeVerified(true);
  }, []);

  const seoConfig = getSEOForPath('/');

  // Si l'âge n'est pas vérifié, afficher la page de vérification
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
        <CategoriesSection />
        <OptimizedAdSections />
        <SafetySection />
        <Footer />
      </div>
    </>
  );
});

Index.displayName = 'Index';

export default Index;
