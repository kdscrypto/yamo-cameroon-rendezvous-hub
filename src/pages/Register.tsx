
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import RegistrationForm from '@/components/auth/RegistrationForm';

const Register = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Design moderne avec moins de jaune */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-amber-600 via-orange-600 to-red-700 rounded-2xl flex items-center justify-center shadow-2xl border border-amber-500/20">
                <span className="text-white font-bold text-2xl drop-shadow-lg">Y</span>
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-amber-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
              Rejoignez Yamo
            </h1>
            <p className="text-muted-foreground text-lg">Créez votre compte pour commencer</p>
          </div>

          <div className="bg-card border rounded-2xl overflow-hidden">
            <div className="text-center pb-6 pt-8 px-6">
              <h2 className="text-2xl font-bold mb-2">Inscription</h2>
              <p className="text-muted-foreground text-base">
                Remplissez vos informations pour créer votre compte
              </p>
            </div>
            
            <div className="px-6 pb-8">
              <RegistrationForm isLoading={isLoading} setIsLoading={setIsLoading} />
            </div>
          </div>
          
          {/* Trust indicators avec design moderne */}
          <div className="text-center mt-6 space-y-2">
            <p className="text-xs text-muted-foreground">
              En créant un compte, vous acceptez nos{' '}
              <a href="/terms" className="text-primary hover:underline transition-colors">
                conditions d'utilisation
              </a>
              {' '}et notre{' '}
              <a href="/privacy" className="text-primary hover:underline transition-colors">
                politique de confidentialité
              </a>
            </p>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Register;
