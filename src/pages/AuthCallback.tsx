
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const processToken = async () => {
      console.log('AuthCallback: Starting token processing');
      console.log('AuthCallback: Current URL:', window.location.href);
      console.log('AuthCallback: Hash fragment:', window.location.hash);

      try {
        // Étape 1 : Lire le token depuis le fragment (#) de l'URL
        const params = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');
        const type = params.get('type');
        const errorParam = params.get('error');

        console.log('AuthCallback: URL parameters:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          type: type,
          error: errorParam
        });

        // Vérifier s'il y a une erreur dans l'URL
        if (errorParam) {
          console.error('AuthCallback: Error in URL:', errorParam);
          navigate('/forgot-password', { 
            state: { error: 'Lien invalide ou expiré. Veuillez demander un nouveau lien.' }
          });
          return;
        }

        // Si le token n'est pas pour la récupération ou est manquant
        if (type !== 'recovery' || !accessToken || !refreshToken) {
          console.log('AuthCallback: Invalid or missing tokens');
          navigate('/forgot-password', { 
            state: { error: 'Lien invalide. Veuillez demander un nouveau lien.' }
          });
          return;
        }

        // Étape 2 : Établir la session avec les tokens
        console.log('AuthCallback: Setting session with tokens');
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (error || !data.session) {
          console.error('AuthCallback: Session setup failed:', error);
          navigate('/forgot-password', { 
            state: { error: 'Lien invalide ou expiré. Veuillez demander un nouveau lien.' }
          });
        } else {
          console.log('AuthCallback: Session established successfully, redirecting to reset password');
          // SUCCÈS ! Une session valide est créée, rediriger vers la page de reset
          navigate('/reset-password');
        }
      } catch (error) {
        console.error('AuthCallback: Unexpected error:', error);
        navigate('/forgot-password', { 
          state: { error: 'Une erreur est survenue. Veuillez réessayer.' }
        });
      }
    };

    processToken();
  }, [navigate]);

  // Page technique invisible - juste un loader
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Vérification du lien...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
