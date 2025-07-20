import * as React from 'react';
import SimpleHeader from '@/components/SimpleHeader';
import SimpleFooter from '@/components/SimpleFooter';
import AgeVerification from '@/components/AgeVerification';
import SEO from '@/components/SEO';

const Index = React.memo(() => {
  const [ageVerified, setAgeVerified] = React.useState(false);

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
  }, []);

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
        
        <section className="py-20 text-center">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-4">Yamo - Application Successfully Loaded!</h1>
            <p className="text-xl text-muted-foreground mb-8">
              The React hooks and router issues have been resolved.
            </p>
            <p className="text-lg">
              Age verification passed ✅<br/>
              Application components loading ✅<br/>
              Ready for full functionality restoration
            </p>
          </div>
        </section>
        
        <SimpleFooter />
      </div>
    </>
  );
});

Index.displayName = 'Index';

export default Index;
