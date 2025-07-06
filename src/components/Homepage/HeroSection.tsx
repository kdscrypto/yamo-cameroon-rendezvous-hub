
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import DynamicColorBackground from './DynamicColorBackground';

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-[600px] flex items-center justify-center overflow-hidden">
      {/* Enhanced dynamic flowing background */}
      <DynamicColorBackground />
      
      <div className="container mx-auto px-4 text-center relative z-10">
        {/* Enhanced main title with gradient text and strong shadow */}
        <h1 
          className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in"
          style={{
            background: 'linear-gradient(135deg, #ffd700 0%, #ffed4e 30%, #f59e0b 70%, #d97706 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            textShadow: '0 4px 8px rgba(0, 0, 0, 0.8), 0 2px 4px rgba(0, 0, 0, 0.6), 0 0 20px rgba(255, 215, 0, 0.3)',
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5))',
          }}
        >
          Bienvenue sur Yamo
        </h1>
        
        {/* Enhanced description with better contrast and readability */}
        <div className="max-w-4xl mx-auto mb-12 space-y-2">
          <p 
            className="text-lg md:text-xl animate-fade-in font-medium"
            style={{
              color: '#f3f4f6',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.8), 0 1px 2px rgba(0, 0, 0, 0.6)',
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))',
            }}
          >
            La plateforme de référence pour les annonces adultes au Cameroun.
          </p>
          <p 
            className="text-lg md:text-xl animate-fade-in font-medium"
            style={{
              color: '#f3f4f6',
              textShadow: '0 2px 4px rgba(0, 0, 0, 0.8), 0 1px 2px rgba(0, 0, 0, 0.6)',
              filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5))',
            }}
          >
            Trouvez ce que vous cherchez en toute discrétion et sécurité.
          </p>
        </div>

        {/* Enhanced action buttons with better visibility and hover effects */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in">
          <Button 
            onClick={() => navigate('/browse')}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold text-lg px-8 py-4 rounded-lg shadow-lg hover:shadow-xl hover:shadow-orange-500/25 transition-all duration-300 hover:scale-105 border-0 backdrop-blur-sm"
            style={{
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(249, 115, 22, 0.2)',
            }}
          >
            Parcourir les annonces
          </Button>
          <Button 
            onClick={() => navigate('/create-ad')}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-semibold text-lg px-8 py-4 rounded-lg shadow-lg hover:shadow-xl hover:shadow-yellow-500/25 transition-all duration-300 hover:scale-105 border-0 backdrop-blur-sm"
            style={{
              boxShadow: '0 8px 16px rgba(0, 0, 0, 0.3), 0 4px 8px rgba(234, 179, 8, 0.2)',
            }}
          >
            Publier une annonce
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
