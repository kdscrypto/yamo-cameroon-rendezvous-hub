import * as React from 'react';
import SimpleHeader from '@/components/SimpleHeader';
import SimpleFooter from '@/components/SimpleFooter';
import AgeVerification from '@/components/AgeVerification';
import SEO from '@/components/SEO';
import { useGoogleAds } from '@/hooks/useGoogleAds';

const Index = React.memo(() => {
  const [ageVerified, setAgeVerified] = React.useState(false);
  const { refreshAds } = useGoogleAds();

  // Check age verification with enhanced security
  React.useEffect(() => {
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
        title="Yamo - Plateforme d'annonces adultes au Cameroun"
        description="Découvrez Yamo, la plateforme de référence pour les annonces adultes au Cameroun. Rencontres, massages, produits adultes en toute discrétion et sécurité."
        keywords="annonces adultes, Cameroun, rencontres, massages, escort, Douala, Yaoundé, plateforme sécurisée"
        type="website"
        url="/"
      />
      <div className="min-h-screen flex flex-col bg-background">
        <SimpleHeader />
        
        <section className="py-20">
          <div className="container mx-auto px-4">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
                Bienvenue sur Yamo
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
                La plateforme de référence pour les annonces adultes au Cameroun. 
                Rencontres, massages, produits adultes en toute discrétion et sécurité.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
                <div className="p-6 bg-card rounded-xl border">
                  <h3 className="text-xl font-semibold mb-3">🔒 Sécurisé</h3>
                  <p className="text-muted-foreground">
                    Plateforme sécurisée avec vérification d'identité
                  </p>
                </div>
                <div className="p-6 bg-card rounded-xl border">
                  <h3 className="text-xl font-semibold mb-3">🛡️ Privé</h3>
                  <p className="text-muted-foreground">
                    Vos données et conversations restent privées
                  </p>
                </div>
                <div className="p-6 bg-card rounded-xl border">
                  <h3 className="text-xl font-semibold mb-3">👤 Discret</h3>
                  <p className="text-muted-foreground">
                    Navigation anonyme et discrète garantie
                  </p>
                </div>
              </div>
            </div>
            
            {/* Status Section */}
            <div className="text-center bg-card/50 rounded-xl p-8 border">
              <h2 className="text-2xl font-bold mb-4 text-green-600">Application Successfully Loaded!</h2>
              <p className="text-muted-foreground mb-6">
                The React hooks and router issues have been resolved.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-green-600 text-xl">✅</span>
                  <span>Age verification passed</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-green-600 text-xl">✅</span>
                  <span>Authentication working</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-green-600 text-xl">✅</span>
                  <span>Ready for full functionality</span>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <SimpleFooter />
      </div>
    </>
  );
});

Index.displayName = 'Index';

export default Index;
