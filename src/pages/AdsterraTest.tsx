import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdsterraSystemCheck from '@/components/ads/AdsterraSystemCheck';
import AdsterraVerification from '@/components/ads/AdsterraVerification';
import SEO from '@/components/SEO';

const AdsterraTest = () => {
  return (
    <>
      <SEO 
        title="Test système Adsterra - Vérification complète"
        description="Page de test et vérification du système Adsterra"
        url="/adsterra-test"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Test système Adsterra</h1>
            <p className="text-muted-foreground">
              Vérification complète du système de publicité Adsterra
            </p>
          </div>

          <AdsterraSystemCheck />
        </main>

        <Footer />
        <AdsterraVerification />
      </div>
    </>
  );
};

export default AdsterraTest;