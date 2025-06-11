
import { useState } from 'react';
import { Search, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdCard from '@/components/AdCard';

const Browse = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [location, setLocation] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  // Mock data pour les annonces
  const ads = [
    {
      id: '1',
      title: 'Belle femme disponible pour rencontres discrètes',
      description: 'Jolie femme de 25 ans, disponible pour des moments de détente et de plaisir...',
      location: 'Douala, Akwa',
      category: 'Rencontres',
      price: '25,000 FCFA',
      isVip: true
    },
    {
      id: '2',
      title: 'Massage relaxant et thérapeutique',
      description: 'Massage professionnel dans un cadre discret et hygiénique. Techniques variées...',
      location: 'Yaoundé, Bastos',
      category: 'Massages',
      price: '15,000 FCFA'
    },
    {
      id: '3',
      title: 'Escort de luxe disponible',
      description: 'Accompagnatrice de haut niveau pour soirées et événements. Élégante et raffinée...',
      location: 'Douala, Bonanjo',
      category: 'Rencontres',
      price: '50,000 FCFA',
      isVip: true
    },
    {
      id: '4',
      title: 'Produits intimes de qualité',
      description: 'Large gamme de produits adultes, livraison discrète dans tout le Cameroun...',
      location: 'Yaoundé, Centre-ville',
      category: 'Produits',
      price: 'Variable'
    },
    {
      id: '5',
      title: 'Jeune homme disponible',
      description: 'Jeune homme de 28 ans, sportif, disponible pour rencontres...',
      location: 'Douala, New Bell',
      category: 'Rencontres',
      price: '20,000 FCFA'
    },
    {
      id: '6',
      title: 'Massage tantrique spécialisé',
      description: 'Massage tantrique par professionnelle expérimentée. Ambiance relaxante...',
      location: 'Yaoundé, Melen',
      category: 'Massages',
      price: '30,000 FCFA'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex-1 px-4 py-8">
        <div className="container mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Parcourir les annonces</h1>
            <p className="text-muted-foreground">
              Trouvez l'annonce qui vous correspond parmi notre sélection
            </p>
          </div>

          {/* Filters */}
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  <SelectItem value="rencontres">Rencontres</SelectItem>
                  <SelectItem value="massages">Massages</SelectItem>
                  <SelectItem value="produits">Produits adultes</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={location} onValueChange={setLocation}>
                <SelectTrigger>
                  <SelectValue placeholder="Localisation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les villes</SelectItem>
                  <SelectItem value="douala">Douala</SelectItem>
                  <SelectItem value="yaounde">Yaoundé</SelectItem>
                  <SelectItem value="bafoussam">Bafoussam</SelectItem>
                  <SelectItem value="bamenda">Bamenda</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger>
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Plus récent</SelectItem>
                  <SelectItem value="price-low">Prix croissant</SelectItem>
                  <SelectItem value="price-high">Prix décroissant</SelectItem>
                  <SelectItem value="popular">Popularité</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">
              {ads.length} annonce{ads.length > 1 ? 's' : ''} trouvée{ads.length > 1 ? 's' : ''}
            </h2>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Filtres avancés
            </Button>
          </div>

          {/* Ads Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {ads.map((ad) => (
              <AdCard key={ad.id} {...ad} />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center mt-12">
            <div className="flex space-x-2">
              <Button variant="outline" disabled>Précédent</Button>
              <Button>1</Button>
              <Button variant="outline">2</Button>
              <Button variant="outline">3</Button>
              <Button variant="outline">Suivant</Button>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Browse;
