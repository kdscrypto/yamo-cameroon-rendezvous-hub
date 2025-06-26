
import { useState, useMemo } from 'react';
import { Search, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SearchResults from '@/components/SearchResults';
import { useApprovedAds } from '@/hooks/useApprovedAds';

const Browse = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [location, setLocation] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const { data: ads = [], isLoading, error } = useApprovedAds();

  // Filter and sort ads based on search criteria
  const filteredAds = useMemo(() => {
    let filtered = [...ads];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ad => 
        ad.title.toLowerCase().includes(query) ||
        ad.description?.toLowerCase().includes(query) ||
        ad.location?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (category !== 'all') {
      filtered = filtered.filter(ad => ad.category.toLowerCase() === category.toLowerCase());
    }

    // Filter by location
    if (location !== 'all') {
      filtered = filtered.filter(ad => ad.location?.toLowerCase().includes(location.toLowerCase()));
    }

    // Sort ads
    switch (sortBy) {
      case 'recent':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'price-low':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'popular':
        // For now, sort by recent as we don't have popularity metrics
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      default:
        break;
    }

    return filtered;
  }, [ads, searchQuery, category, location, sortBy]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Erreur de chargement</h2>
            <p className="text-muted-foreground">
              Impossible de charger les annonces. Veuillez réessayer.
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex-1 px-4 py-8">
        <div className="container mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Parcourir les annonces</h1>
            <p className="text-muted-foreground">
              Trouvez l'annonce qui vous correspond parmi notre sélection d'annonces approuvées
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

          {/* Search Results */}
          <SearchResults
            results={filteredAds}
            query={searchQuery}
            totalResults={filteredAds.length}
            loading={isLoading}
          />

          {/* Pagination - For future implementation */}
          {filteredAds.length > 0 && (
            <div className="flex justify-center mt-12">
              <div className="flex space-x-2">
                <Button variant="outline" disabled>Précédent</Button>
                <Button>1</Button>
                <Button variant="outline">Suivant</Button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Browse;
