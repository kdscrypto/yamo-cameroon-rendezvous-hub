
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Eye } from 'lucide-react';

interface AgeVerificationProps {
  onConfirm: () => void;
}

const AgeVerification = ({ onConfirm }: AgeVerificationProps) => {
  const [isExiting, setIsExiting] = useState(false);

  const handleExit = () => {
    setIsExiting(true);
    setTimeout(() => {
      window.location.href = 'https://www.google.com';
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-850 to-neutral-800 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/50 rounded-full blur-3xl"></div>
      </div>
      
      {/* Main content container with glassmorphism */}
      <div className={`relative max-w-2xl mx-auto transition-all duration-300 ${isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <div className="glass-morphism p-8 md:p-12 rounded-2xl shadow-2xl border border-primary/20">
          
          {/* Logo section */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-3 group">
              <div className="w-16 h-16 gradient-gold rounded-xl flex items-center justify-center shadow-luxury group-hover:shadow-glow transition-all duration-300">
                <span className="text-black font-bold text-3xl">Y</span>
              </div>
              <span className="text-4xl font-bold text-gradient-gold">amo</span>
            </div>
          </div>

          {/* Trust indicators */}
          <div className="flex justify-center items-center space-x-6 mb-8 text-primary/80">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span className="text-sm font-medium">Sécurisé</span>
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="w-5 h-5" />
              <span className="text-sm font-medium">Privé</span>
            </div>
            <div className="flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span className="text-sm font-medium">Discret</span>
            </div>
          </div>

          {/* Main heading with improved typography */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 leading-tight">
              Vérification d'âge requise
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary/50 mx-auto rounded-full"></div>
          </div>

          {/* Description with better readability */}
          <div className="text-center mb-10">
            <div className="bg-card/30 backdrop-blur-sm rounded-xl p-6 border border-border/30">
              <p className="text-lg text-yellow-200 leading-relaxed mb-4">
                Ce site contient du contenu destiné aux adultes uniquement.
              </p>
              <p className="text-base text-yellow-300/90 leading-relaxed">
                En continuant, vous confirmez avoir <strong className="text-primary">18 ans ou plus</strong> et 
                acceptez de consulter du contenu réservé aux adultes. Votre confidentialité et votre sécurité 
                sont nos priorités absolues.
              </p>
            </div>
          </div>

          {/* Action buttons with improved UX */}
          <div className="space-y-4">
            <Button 
              onClick={onConfirm}
              size="lg"
              className="w-full gradient-gold text-black hover:opacity-90 active:scale-[0.98] px-8 py-4 text-lg font-semibold border-0 rounded-xl shadow-lg hover:shadow-luxury transition-all duration-300 transform hover:-translate-y-0.5"
            >
              <Shield className="w-5 h-5 mr-2" />
              J'ai 18 ans ou plus - Accéder au site
            </Button>
            
            <Button 
              onClick={handleExit}
              variant="outline"
              size="lg"
              className="w-full border-2 border-primary/60 text-primary hover:bg-primary/10 hover:border-primary px-8 py-4 text-lg font-semibold bg-transparent rounded-xl transition-all duration-300 transform hover:-translate-y-0.5"
            >
              J'ai moins de 18 ans - Quitter
            </Button>
          </div>

          {/* Footer information */}
          <div className="mt-8 pt-6 border-t border-border/30">
            <div className="text-center">
              <p className="text-sm text-yellow-400/80 mb-2">
                Protection des mineurs
              </p>
              <p className="text-xs text-yellow-500/70 leading-relaxed">
                Notre <button className="text-primary hover:text-primary/80 underline transition-colors duration-200">
                  page de contrôle parental
                </button> vous explique comment bloquer facilement l'accès à ce site.
              </p>
            </div>
          </div>

          {/* Legal compliance indicator */}
          <div className="flex justify-center mt-6">
            <div className="flex items-center space-x-2 text-xs text-yellow-600/60">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Conforme aux réglementations en vigueur</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgeVerification;
