
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
      {/* Background overlay pour créer l'effet sombre */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      {/* Effets de lumière subtils */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>
      
      <div className="container mx-auto px-4 text-center relative z-10">
        {/* Titre principal - exactement comme dans l'image */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-yellow-400 mb-6 animate-fade-in">
          Bienvenue sur Yamo
        </h1>
        
        {/* Description - exactement comme dans l'image */}
        <div className="max-w-4xl mx-auto mb-12 space-y-2">
          <p className="text-lg md:text-xl text-gray-200 animate-fade-in">
            La plateforme de référence pour les annonces adultes au Cameroun.
          </p>
          <p className="text-lg md:text-xl text-gray-200 animate-fade-in">
            Trouvez ce que vous cherchez en toute discrétion et sécurité.
          </p>
        </div>

        {/* Boutons d'action - exactement comme dans l'image */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
          <Button 
            onClick={() => navigate('/browse')}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-lg px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0"
          >
            Parcourir les annonces
          </Button>
          <Button 
            onClick={() => navigate('/create-ad')}
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold text-lg px-8 py-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-0"
          >
            Publier une annonce
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
