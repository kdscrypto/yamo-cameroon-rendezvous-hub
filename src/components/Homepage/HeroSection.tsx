
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import SearchBar from '@/components/SearchBar';

const HeroSection = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/browse');
    }
  };

  return (
    <section className="section-enhanced section-enhanced-highlight min-h-[600px] flex items-center justify-center relative overflow-hidden">
      {/* Gradient overlay amélioré */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-900 via-neutral-850 to-neutral-900 opacity-95"></div>
      
      {/* Effets de lumière */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        {/* Titre principal avec hiérarchie améliorée */}
        <h1 className="text-hierarchy-primary mb-6 animate-fade-in">
          Découvrez Yamo
        </h1>
        
        {/* Sous-titre avec contraste amélioré */}
        <p className="text-hierarchy-body max-w-3xl mx-auto mb-8 animate-fade-in">
          La plateforme de <span className="text-primary-400 font-semibold">rencontres</span>, 
          <span className="text-primary-400 font-semibold"> massages</span> et 
          <span className="text-primary-400 font-semibold"> produits</span> de qualité. 
          Rejoignez une communauté exclusive et découvrez des expériences uniques.
        </p>

        {/* Barre de recherche améliorée */}
        <div className="max-w-2xl mx-auto mb-8 animate-fade-in">
          <div className="relative">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              onSearch={handleSearch}
              placeholder="Que recherchez-vous ?"
              className="bg-neutral-800/80 backdrop-blur-sm border-primary/30 focus:border-primary/60 text-neutral-100 placeholder:text-neutral-400 h-14 text-lg shadow-lg"
            />
            <Button 
              onClick={handleSearch}
              className="absolute right-2 top-2 h-10 px-6 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              <Search className="w-5 h-5 mr-2" />
              Rechercher
            </Button>
          </div>
        </div>

        {/* Boutons d'action avec hiérarchie */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
          <Button 
            onClick={() => navigate('/browse')}
            className="btn-primary-enhanced text-lg px-8 py-4"
          >
            Explorer les annonces
          </Button>
          <Button 
            onClick={() => navigate('/register')}
            className="btn-secondary-enhanced text-lg px-8 py-4"
          >
            Créer un compte
          </Button>
        </div>

        {/* Statistiques avec visibilité améliorée */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-hierarchy-secondary text-primary-400 mb-2">1000+</div>
            <div className="text-hierarchy-caption">Annonces actives</div>
          </div>
          <div className="text-center">
            <div className="text-hierarchy-secondary text-primary-400 mb-2">500+</div>
            <div className="text-hierarchy-caption">Utilisateurs satisfaits</div>
          </div>
          <div className="text-center">
            <div className="text-hierarchy-secondary text-primary-400 mb-2">24/7</div>
            <div className="text-hierarchy-caption">Support disponible</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
