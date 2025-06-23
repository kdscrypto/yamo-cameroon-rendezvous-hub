
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import AdCard from '@/components/AdCard';

const AdSections = () => {
  const featuredAds = [
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
      id: '3',
      title: 'Escort de luxe disponible',
      description: 'Accompagnatrice de haut niveau pour soirées et événements...',
      location: 'Douala, Bonanjo',
      category: 'Rencontres',
      price: '50,000 FCFA',
      isVip: true
    },
    {
      id: '5',
      title: 'Massage tantrique professionnel',
      description: 'Expérience relaxante dans un cadre luxueux et discret...',
      location: 'Yaoundé, Bastos',
      category: 'Massages',
      price: '35,000 FCFA',
      isVip: true
    },
    {
      id: '6',
      title: 'Accompagnatrice VIP événements',
      description: 'Pour vos soirées d\'affaires et événements prestigieux...',
      location: 'Yaoundé, Centre-ville',
      category: 'Rencontres',
      price: '75,000 FCFA',
      isVip: true
    }
  ];

  const recentAds = [
    {
      id: '2',
      title: 'Massage relaxant et thérapeutique',
      description: 'Massage professionnel dans un cadre discret et hygiénique...',
      location: 'Yaoundé, Bastos',
      category: 'Massages',
      price: '15,000 FCFA'
    },
    {
      id: '4',
      title: 'Produits intimes de qualité',
      description: 'Large gamme de produits adultes, livraison discrète...',
      location: 'Yaoundé, Centre-ville',
      category: 'Produits',
      price: 'Variable'
    },
    {
      id: '7',
      title: 'Rencontre discrète disponible',
      description: 'Femme mature pour moments de détente et de plaisir...',
      location: 'Douala, Bonapriso',
      category: 'Rencontres',
      price: '20,000 FCFA'
    },
    {
      id: '8',
      title: 'Accessoires intimes premium',
      description: 'Collection exclusive d\'accessoires pour adultes...',
      location: 'Yaoundé, Melen',
      category: 'Produits',
      price: '5,000 FCFA'
    }
  ];

  const doualaAds = [
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
      id: '3',
      title: 'Escort de luxe disponible',
      description: 'Accompagnatrice de haut niveau pour soirées et événements...',
      location: 'Douala, Bonanjo',
      category: 'Rencontres',
      price: '50,000 FCFA',
      isVip: true
    },
    {
      id: '7',
      title: 'Rencontre discrète disponible',
      description: 'Femme mature pour moments de détente et de plaisir...',
      location: 'Douala, Bonapriso',
      category: 'Rencontres',
      price: '20,000 FCFA'
    },
    {
      id: '9',
      title: 'Massage professionnel Douala',
      description: 'Massage relaxant dans un environnement calme...',
      location: 'Douala, Deido',
      category: 'Massages',
      price: '12,000 FCFA'
    }
  ];

  const yaoundeAds = [
    {
      id: '5',
      title: 'Massage tantrique professionnel',
      description: 'Expérience relaxante dans un cadre luxueux et discret...',
      location: 'Yaoundé, Bastos',
      category: 'Massages',
      price: '35,000 FCFA',
      isVip: true
    },
    {
      id: '6',
      title: 'Accompagnatrice VIP événements',
      description: 'Pour vos soirées d\'affaires et événements prestigieux...',
      location: 'Yaoundé, Centre-ville',
      category: 'Rencontres',
      price: '75,000 FCFA',
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
      id: '8',
      title: 'Accessoires intimes premium',
      description: 'Collection exclusive d\'accessoires pour adultes...',
      location: 'Yaoundé, Melen',
      category: 'Produits',
      price: '5,000 FCFA'
    }
  ];

  return (
    <>
      {/* Featured Ads Section */}
      <section className="py-16 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">⭐ Annonces en vedette</h2>
            <Button variant="outline" asChild>
              <Link to="/browse">Voir toutes les annonces premium</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredAds.map((ad) => (
              <AdCard key={ad.id} {...ad} />
            ))}
          </div>
        </div>
      </section>

      {/* Recent Ads Section */}
      <section className="py-16 px-4">
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

      {/* Hot à Douala Section */}
      <section className="py-16 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">🔥 Hot à Douala</h2>
            <Button variant="outline" asChild>
              <Link to="/browse?location=douala">Voir toutes les annonces Douala</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {doualaAds.map((ad) => (
              <AdCard key={ad.id} {...ad} />
            ))}
          </div>
        </div>
      </section>

      {/* Hot à Yaoundé Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold">🔥 Hot à Yaoundé</h2>
            <Button variant="outline" asChild>
              <Link to="/browse?location=yaounde">Voir toutes les annonces Yaoundé</Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {yaoundeAds.map((ad) => (
              <AdCard key={ad.id} {...ad} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default AdSections;
