
import { Users, Heart, Settings } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CategoryCard from '@/components/CategoryCard';
import AdCard from '@/components/AdCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

const Index = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Clean, modern background images
  const backgroundImages = [
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80",
    "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
  ];

  // Change image every 8 seconds for a more subtle effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        (prevIndex + 1) % backgroundImages.length
      );
    }, 8000);

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  // Mock data for recent ads
  const recentAds = [
    {
      id: '1',
      title: 'Belle femme disponible pour rencontres discrètes',
      description: 'Jolie femme de 25 ans, disponible pour des moments de détente...',
      location: 'Douala, Akwa',
      category: 'Rencontres',
      price: '25,000 FCFA',
      isVip: true
    },
    {
      id: '2',
      title: 'Massage relaxant et thérapeutique',
      description: 'Massage professionnel dans un cadre discret et hygiénique...',
      location: 'Yaoundé, Bastos',
      category: 'Massages',
      price: '15,000 FCFA'
    },
    {
      id: '3',
      title: 'Escort de luxe disponible',
      description: 'Accompagnatrice de haut niveau pour soirées et événements...',
      location: 'Douala, Bonanjo',
      category: 'Rencontres',
      price: '50,000 FCFA',
      isVip: true
    },
    {
      id: '4',
      title: 'Produits intimes de qualité',
      description: 'Large gamme de produits adultes, livraison discrète...',
      location: 'Yaoundé, Centre-ville',
      category: 'Produits',
      price: 'Variable'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      {/* Stripe-inspired Hero Section */}
      <section className="relative py-24 px-4 overflow-hidden">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-stripe-gray-50 to-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(98,84,243,0.1)_1px,transparent_0)] bg-[length:24px_24px]" />
        </div>

        {/* Content */}
        <div className="container mx-auto text-center relative z-10 max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-8 text-foreground leading-tight">
            Bienvenue sur{' '}
            <span className="text-gradient-stripe">Yamo</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
            La plateforme de référence pour les annonces adultes au Cameroun. 
            Trouvez ce que vous cherchez en toute discrétion et sécurité.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="text-lg px-8 py-6 h-auto rounded-lg" asChild>
              <Link to="/browse">Parcourir les annonces</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 h-auto rounded-lg border-2" asChild>
              <Link to="/create-ad">Publier une annonce</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section with Stripe-inspired cards */}
      <section className="py-20 px-4 bg-stripe-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-foreground">Nos catégories</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Découvrez nos différentes catégories d'annonces soigneusement organisées pour vous
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <CategoryCard
              title="Rencontres"
              description="Rencontres discrètes, escorts, accompagnatrices"
              icon={Users}
              href="/rencontres"
              gradient="gradient-stripe"
            />
            <CategoryCard
              title="Massages"
              description="Massages relaxants, thérapeutiques et bien-être"
              icon={Heart}
              href="/massages"
              gradient="gradient-stripe"
            />
            <CategoryCard
              title="Produits adultes"
              description="Accessoires, lingerie et produits intimes"
              icon={Settings}
              href="/produits"
              gradient="gradient-stripe"
            />
          </div>
        </div>
      </section>

      {/* Recent Ads Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-16">
            <div>
              <h2 className="text-4xl font-bold mb-4 text-foreground">Annonces récentes</h2>
              <p className="text-lg text-muted-foreground">Les dernières annonces publiées sur notre plateforme</p>
            </div>
            <Button variant="outline" className="border-2 px-6 py-3 h-auto rounded-lg" asChild>
              <Link to="/browse">Voir toutes les annonces</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recentAds.map((ad) => (
              <AdCard key={ad.id} {...ad} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Safety Section - Stripe-inspired */}
      <section className="py-20 px-4 bg-stripe-gray-50">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-foreground">Sécurité et confidentialité</h2>
              <p className="text-lg text-muted-foreground">
                Votre sécurité est notre priorité. Nous mettons en place des mesures strictes 
                pour protéger vos données personnelles et garantir des échanges sécurisés.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 gradient-stripe rounded-lg flex items-center justify-center mb-6">
                  <span className="text-white text-xl">🔒</span>
                </div>
                <h3 className="font-semibold text-xl mb-3 text-foreground">Données protégées</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Vos informations personnelles sont chiffrées et sécurisées selon les standards les plus élevés
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 gradient-stripe rounded-lg flex items-center justify-center mb-6">
                  <span className="text-white text-xl">✅</span>
                </div>
                <h3 className="font-semibold text-xl mb-3 text-foreground">Modération active</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Toutes les annonces sont vérifiées avant publication par notre équipe de modération
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <div className="w-12 h-12 gradient-stripe rounded-lg flex items-center justify-center mb-6">
                  <span className="text-white text-xl">🚫</span>
                </div>
                <h3 className="font-semibold text-xl mb-3 text-foreground">Anti-spam</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Protection avancée contre les faux profils et tentatives d'arnaque
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
