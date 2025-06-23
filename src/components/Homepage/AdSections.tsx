
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import AdCard from '@/components/AdCard';

const AdSections = () => {
  const featuredAds = [
    {
      id: '1',
      title: 'Sofia - Accompagnatrice de luxe disponible',
      description: 'Belle femme raffinée, 26 ans, pour soirées exclusives et moments privilégiés...',
      location: 'Douala, Akwa',
      category: 'Rencontres',
      price: '85,000 FCFA',
      isVip: true,
      imageUrl: 'https://images.unsplash.com/photo-1494790108755-2616c9c8bc8b?w=400&h=400&fit=crop'
    },
    {
      id: '2',
      title: 'Massage tantrique authentique - Yasmine',
      description: 'Masseuse professionnelle certifiée, cadre luxueux et discret...',
      location: 'Yaoundé, Bastos',
      category: 'Massages',
      price: '45,000 FCFA',
      isVip: true,
      imageUrl: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=400&fit=crop'
    },
    {
      id: '3',
      title: 'Camille - Escort VIP événements',
      description: 'Accompagnatrice élégante pour galas, dîners d\'affaires et soirées prestigieuses...',
      location: 'Yaoundé, Centre-ville',
      category: 'Rencontres',
      price: '120,000 FCFA',
      isVip: true,
      imageUrl: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&h=400&fit=crop'
    },
    {
      id: '4',
      title: 'Collection Lingerie Premium',
      description: 'Lingerie de luxe importée, dentelles fines et soies naturelles...',
      location: 'Douala, Bonanjo',
      category: 'Produits',
      price: '25,000 FCFA',
      isVip: true,
      imageUrl: 'https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?w=400&h=400&fit=crop'
    }
  ];

  const recentAds = [
    {
      id: '5',
      title: 'Massage relaxant thérapeutique',
      description: 'Massage professionnel anti-stress dans un environnement zen...',
      location: 'Yaoundé, Melen',
      category: 'Massages',
      price: '18,000 FCFA',
      imageUrl: 'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?w=400&h=400&fit=crop'
    },
    {
      id: '6',
      title: 'Laura - Rencontre discrète',
      description: 'Femme sophistiquée, 28 ans, pour moments de détente et complicité...',
      location: 'Douala, Bonapriso',
      category: 'Rencontres',
      price: '35,000 FCFA',
      imageUrl: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop'
    },
    {
      id: '7',
      title: 'Accessoires intimes de qualité',
      description: 'Gamme complète d\'accessoires pour adultes, livraison ultra-discrète...',
      location: 'Yaoundé, Essos',
      category: 'Produits',
      price: '12,000 FCFA',
      imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400&h=400&fit=crop'
    },
    {
      id: '8',
      title: 'Mélanie - Massage sensuel',
      description: 'Expérience relaxante dans un cadre feutré et parfumé...',
      location: 'Douala, Deido',
      category: 'Massages',
      price: '22,000 FCFA',
      imageUrl: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=400&h=400&fit=crop'
    }
  ];

  // Annonces spécifiquement de Douala
  const doualaAds = [
    {
      id: '9',
      title: 'Vanessa - Belle femme disponible',
      description: 'Charmante demoiselle de 24 ans, douce et attentionnée...',
      location: 'Douala, Akwa',
      category: 'Rencontres',
      price: '28,000 FCFA',
      isVip: true,
      imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop'
    },
    {
      id: '10',
      title: 'Jessica - Escort de charme',
      description: 'Accompagnatrice raffinée pour vos sorties et événements à Douala...',
      location: 'Douala, Bonanjo',
      category: 'Rencontres',
      price: '65,000 FCFA',
      isVip: true,
      imageUrl: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=400&h=400&fit=crop'
    },
    {
      id: '11',
      title: 'Centre Wellness Douala',
      description: 'Massages professionnels dans le quartier calme de Bonapriso...',
      location: 'Douala, Bonapriso',
      category: 'Massages',
      price: '15,000 FCFA',
      imageUrl: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop'
    },
    {
      id: '12',
      title: 'Patricia - Moments privilégiés',
      description: 'Femme mature et expérimentée pour des rencontres authentiques...',
      location: 'Douala, New Bell',
      category: 'Rencontres',
      price: '32,000 FCFA',
      imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=400&fit=crop'
    }
  ];

  // Annonces spécifiquement de Yaoundé
  const yaoundeAds = [
    {
      id: '13',
      title: 'Isabelle - Accompagnatrice VIP',
      description: 'Femme élégante et cultivée pour vos événements prestigieux à Yaoundé...',
      location: 'Yaoundé, Bastos',
      category: 'Rencontres',
      price: '95,000 FCFA',
      isVip: true,
      imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop'
    },
    {
      id: '14',
      title: 'Spa Lotus - Massages de luxe',
      description: 'Institut de beauté haut de gamme, massages aux huiles essentielles...',
      location: 'Yaoundé, Centre-ville',
      category: 'Massages',
      price: '38,000 FCFA',
      isVip: true,
      imageUrl: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=400&h=400&fit=crop'
    },
    {
      id: '15',
      title: 'Nathalie - Rencontre discrète',
      description: 'Jeune femme dynamique, 25 ans, pour moments de complicité...',
      location: 'Yaoundé, Melen',
      category: 'Rencontres',
      price: '30,000 FCFA',
      imageUrl: 'https://images.unsplash.com/photo-1619895862022-09114b41f16f?w=400&h=400&fit=crop'
    },
    {
      id: '16',
      title: 'Wellness Center Yaoundé',
      description: 'Massages thérapeutiques et relaxants dans un cadre moderne...',
      location: 'Yaoundé, Emombo',
      category: 'Massages',
      price: '20,000 FCFA',
      imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop'
    }
  ];

  return (
    <>
      {/* Featured Ads Section */}
      <section className="py-12 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">⭐ Annonces en vedette</h2>
            <Button variant="outline" asChild>
              <Link to="/browse?featured=true">Voir toutes les annonces premium</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {featuredAds.map((ad) => (
              <AdCard key={ad.id} {...ad} />
            ))}
          </div>
        </div>
      </section>

      {/* Recent Ads Section */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Annonces récentes</h2>
            <Button variant="outline" asChild>
              <Link to="/browse">Voir toutes les annonces</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {recentAds.map((ad) => (
              <AdCard key={ad.id} {...ad} />
            ))}
          </div>
        </div>
      </section>

      {/* Hot à Douala Section - Only Douala ads */}
      <section className="py-12 px-4 bg-card/30">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">🔥 Hot à Douala</h2>
            <Button variant="outline" asChild>
              <Link to="/browse?location=douala">Voir toutes les annonces Douala</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {doualaAds.map((ad) => (
              <AdCard key={ad.id} {...ad} />
            ))}
          </div>
        </div>
      </section>

      {/* Hot à Yaoundé Section - Only Yaoundé ads */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">🔥 Hot à Yaoundé</h2>
            <Button variant="outline" asChild>
              <Link to="/browse?location=yaounde">Voir toutes les annonces Yaoundé</Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
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
