
import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AgeVerification from '@/components/AgeVerification';
import HeroSection from '@/components/Homepage/HeroSection';
import CategoriesSection from '@/components/Homepage/CategoriesSection';
import OptimizedAdSections from '@/components/Homepage/OptimizedAdSections';
import SafetySection from '@/components/Homepage/SafetySection';

const Index = React.memo(() => {
  const [ageVerified, setAgeVerified] = useState(false);

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

  // Si l'âge n'est pas vérifié, afficher la page de vérification
  if (!ageVerified) {
    return <AgeVerification onConfirm={handleAgeVerification} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <HeroSection />
      <CategoriesSection />
      <OptimizedAdSections />
      <SafetySection />
      <Footer />
    </div>
  );
});

Index.displayName = 'Index';

export default Index;
