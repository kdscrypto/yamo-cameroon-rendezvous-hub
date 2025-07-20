
import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Shield, Lock, Eye, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AgeVerificationProps {
  onConfirm: () => void;
}

const AgeVerification = ({ onConfirm }: AgeVerificationProps) => {
  const [isExiting, setIsExiting] = React.useState(false);
  const [buttonEnabled, setButtonEnabled] = React.useState(false);
  const [countdown, setCountdown] = React.useState(3);

  // Security delay before button becomes clickable
  React.useEffect(() => {
    console.log('AgeVerification: Component mounted, starting security delay');
    
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setButtonEnabled(true);
          console.log('AgeVerification: Button enabled after security delay');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, []);

  const handleConfirm = () => {
    if (!buttonEnabled) {
      console.log('AgeVerification: Attempt to confirm before button enabled - blocked');
      return;
    }
    
    console.log('AgeVerification: Age verification confirmed by user');
    // Use sessionStorage instead of localStorage for session-only persistence
    sessionStorage.setItem('ageVerified', 'true');
    sessionStorage.setItem('ageVerifiedTimestamp', Date.now().toString());
    onConfirm();
  };

  const handleExit = () => {
    console.log('AgeVerification: User chose to exit (under 18)');
    setIsExiting(true);
    setTimeout(() => {
      window.location.href = 'https://www.google.com';
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Enhanced background with animated gradients */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>
      
      {/* Main content container with modern glassmorphism */}
      <div className={`relative max-w-2xl mx-auto transition-all duration-500 ${isExiting ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
        <div className="bg-white/10 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl border border-white/20 relative overflow-hidden">
          
          {/* Subtle inner glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl"></div>
          
          {/* Logo section with modern styling */}
          <div className="flex justify-center mb-8 relative z-10">
            <div className="flex items-center space-x-4 group">
              <div className="w-18 h-18 bg-gradient-to-br from-amber-400 via-orange-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl group-hover:shadow-amber-500/50 transition-all duration-300 transform group-hover:scale-105">
                <span className="text-white font-bold text-4xl drop-shadow-lg">Y</span>
              </div>
              <div className="flex items-center">
                <span className="text-5xl font-bold bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 bg-clip-text text-transparent">amo</span>
                <Sparkles className="w-6 h-6 text-amber-400 ml-2 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Enhanced trust indicators */}
          <div className="flex justify-center items-center space-x-8 mb-10 relative z-10">
            <div className="flex items-center space-x-3 bg-white/5 rounded-full px-4 py-2 backdrop-blur-sm border border-white/10">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-medium text-white/90">Sécurisé</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/5 rounded-full px-4 py-2 backdrop-blur-sm border border-white/10">
              <Lock className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-medium text-white/90">Privé</span>
            </div>
            <div className="flex items-center space-x-3 bg-white/5 rounded-full px-4 py-2 backdrop-blur-sm border border-white/10">
              <Eye className="w-5 h-5 text-purple-400" />
              <span className="text-sm font-medium text-white/90">Discret</span>
            </div>
          </div>

          {/* Modern heading with gradient text */}
          <div className="text-center mb-10 relative z-10">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
                Vérification d'âge
              </span>
              <br />
              <span className="bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 bg-clip-text text-transparent">
                requise
              </span>
            </h1>
            <div className="w-32 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-pink-500 mx-auto rounded-full shadow-lg"></div>
          </div>

          {/* Enhanced description with better contrast */}
          <div className="text-center mb-12 relative z-10">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-xl">
              <p className="text-xl text-white/95 leading-relaxed mb-6 font-medium">
                Ce site contient du contenu destiné aux adultes uniquement.
              </p>
              <p className="text-lg text-white/80 leading-relaxed">
                En continuant, vous confirmez avoir <strong className="text-amber-400 font-bold">18 ans ou plus</strong> et 
                acceptez de consulter du contenu réservé aux adultes. Votre confidentialité et votre 
                sécurité sont nos <strong className="text-emerald-400">priorités absolues</strong>.
              </p>
            </div>
          </div>

          {/* Modern security countdown */}
          {!buttonEnabled && (
            <div className="text-center mb-8 relative z-10">
              <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-400/30 rounded-2xl p-6 backdrop-blur-sm">
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-amber-100 text-lg font-medium">
                    Initialisation sécurisée... {countdown}s
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Modern action buttons */}
          <div className="space-y-6 relative z-10">
            <Button 
              onClick={handleConfirm}
              disabled={!buttonEnabled}
              size="lg"
              className={`w-full px-8 py-6 text-lg font-bold rounded-2xl shadow-2xl transition-all duration-300 transform border-0 ${
                buttonEnabled 
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-pink-500 text-white hover:from-amber-400 hover:via-orange-400 hover:to-pink-400 hover:scale-[1.02] hover:shadow-amber-500/50 active:scale-[0.98]' 
                  : 'bg-gray-600/50 text-gray-300 cursor-not-allowed opacity-60'
              }`}
            >
              <Shield className="w-6 h-6 mr-3" />
              {buttonEnabled ? "J'ai 18 ans ou plus - Accéder au site" : `Disponible dans ${countdown}s`}
            </Button>
            
            <Button 
              onClick={handleExit}
              variant="outline"
              size="lg"
              className="w-full border-2 border-white/30 text-white/90 hover:bg-white/10 hover:border-white/50 hover:text-white px-8 py-6 text-lg font-bold bg-transparent rounded-2xl transition-all duration-300 transform hover:scale-[1.02] backdrop-blur-sm"
            >
              J'ai moins de 18 ans - Quitter
            </Button>
          </div>

          {/* Enhanced footer with modern styling */}
          <div className="mt-12 pt-8 border-t border-white/20 relative z-10">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Shield className="w-5 h-5 text-emerald-400" />
                <p className="text-lg font-semibold text-white/90">
                  Protection des mineurs
                </p>
              </div>
              <p className="text-sm text-white/70 leading-relaxed mb-4">
                Notre <Link 
                  to="/controle-parental" 
                  className="text-amber-400 hover:text-amber-300 underline transition-colors duration-200 font-medium"
                >
                  page de contrôle parental
                </Link> vous explique comment bloquer facilement l'accès à ce site.
              </p>
            </div>
          </div>

          {/* Modern compliance indicator */}
          <div className="flex justify-center mt-8 relative z-10">
            <div className="flex items-center space-x-3 bg-emerald-500/20 rounded-full px-6 py-3 backdrop-blur-sm border border-emerald-400/30">
              <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
              <span className="text-sm font-medium text-emerald-100">Conforme aux réglementations en vigueur</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgeVerification;
