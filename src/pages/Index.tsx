
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AgeVerification from '@/components/AgeVerification';
import HeroSection from '@/components/Homepage/HeroSection';
import CategoriesSection from '@/components/Homepage/CategoriesSection';
import AdSections from '@/components/Homepage/AdSections';
import SafetySection from '@/components/Homepage/SafetySection';

const Index = () => {
  const [ageVerified, setAgeVerified] = useState(false);

  // Vérifier si l'utilisateur a déjà confirmé son âge
  useEffect(() => {
    const verified = localStorage.getItem('ageVerified');
    if (verified === 'true') {
      setAgeVerified(true);
    }
  }, []);

  const handleAgeVerification = () => {
    localStorage.setItem('ageVerified', 'true');
    setAgeVerified(true);
  };

  // Si l'âge n'est pas vérifié, afficher la page de vérification
  if (!ageVerified) {
    return <AgeVerification onConfirm={handleAgeVerification} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <HeroSection />
      <CategoriesSection />
      <AdSections />
      <SafetySection />
      <Footer />
    </div>
  );
};

export default Index;
