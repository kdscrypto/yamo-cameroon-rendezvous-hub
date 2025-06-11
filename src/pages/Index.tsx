
import { Users, Heart, Settings } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import CategoryCard from '@/components/CategoryCard';
import AdCard from '@/components/AdCard';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Index = () => {
  // Mock data pour les annonces récentes
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
      
      {/* Hero Section */}
      <section className="relative py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Bienvenue sur <span className="text-gradient-gold">Yamo</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            La plateforme de référence pour les annonces adultes au Cameroun. 
            Trouvez ce que vous cherchez en toute discrétion et sécurité.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/browse">Parcourir les annonces</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/create-ad">Publier une annonce</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Nos catégories</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <CategoryCard
              title="Rencontres"
              description="Rencontres discrètes, escorts, accompagnatrices"
              icon={Users}
              href="/rencontres"
              gradient="gradient-gold"
            />
            <CategoryCard
              title="Massages"
              description="Massages relaxants, thérapeutiques et bien-être"
              icon={Heart}
              href="/massages"
              gradient="bg-gradient-to-br from-pink-500 to-rose-400"
            />
            <CategoryCard
              title="Produits adultes"
              description="Accessoires, lingerie et produits intimes"
              icon={Settings}
              href="/produits"
              gradient="bg-gradient-to-br from-purple-500 to-indigo-400"
            />
          </div>
        </div>
      </section>

      {/* Recent Ads Section */}
      <section className="py-16 px-4 bg-card/50">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">Annonces récentes</h2>
            <Button variant="outline" asChild>
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

      {/* Safety Information */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="bg-card border border-border rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Sécurité et confidentialité</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Votre sécurité est notre priorité. Nous mettons en place des mesures strictes 
              pour protéger vos données personnelles et garantir des échanges sécurisés.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <h3 className="font-semibold text-primary mb-2">🔒 Données protégées</h3>
                <p className="text-muted-foreground">Vos informations personnelles sont chiffrées et sécurisées</p>
              </div>
              <div>
                <h3 className="font-semibold text-primary mb-2">✅ Modération active</h3>
                <p className="text-muted-foreground">Toutes les annonces sont vérifiées avant publication</p>
              </div>
              <div>
                <h3 className="font-semibold text-primary mb-2">🚫 Anti-spam</h3>
                <p className="text-muted-foreground">Protection contre les faux profils et arnaques</p>
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
