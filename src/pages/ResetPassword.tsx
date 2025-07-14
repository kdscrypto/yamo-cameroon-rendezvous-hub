
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { UnifiedPasswordResetForm } from '@/components/auth/UnifiedPasswordResetForm';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const ResetPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false); // Par défaut, le formulaire n'est pas prêt
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  console.log('🔧 ResetPassword: Component loaded');
  console.log('🔧 ResetPassword: Current URL:', window.location.href);
  console.log('🔧 ResetPassword: Hash:', window.location.hash);
  console.log('🔧 ResetPassword: Search:', window.location.search);

  // Vérification et validation des tokens directement depuis l'URL
  useEffect(() => {
    const validateAndSetSession = async () => {
      console.log('ResetPassword: Début de la validation des tokens');
      console.log('ResetPassword: URL actuelle:', window.location.href);
      console.log('ResetPassword: Hash:', window.location.hash);
      console.log('ResetPassword: Search:', window.location.search);
      
      try {
        // D'abord vérifier s'il y a déjà une session valide
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        
        if (existingSession) {
          console.log('ResetPassword: Session existante trouvée');
          setIsReady(true);
          setIsCheckingSession(false);
          return;
        }

        // Extraire les tokens depuis l'URL (hash ou query params)
        let accessToken = null;
        let refreshToken = null;
        let tokenType = null;

        // Vérifier d'abord dans le hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        accessToken = hashParams.get('access_token');
        refreshToken = hashParams.get('refresh_token');
        tokenType = hashParams.get('type');

        // Si pas trouvé dans le hash, vérifier dans les query params
        if (!accessToken) {
          const searchParams = new URLSearchParams(window.location.search);
          accessToken = searchParams.get('access_token');
          refreshToken = searchParams.get('refresh_token');
          tokenType = searchParams.get('type');
        }

        console.log('ResetPassword: Tokens extraits:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          type: tokenType
        });

        // Vérifier que nous avons les tokens nécessaires
        if (!accessToken || tokenType !== 'recovery') {
          console.log('ResetPassword: Tokens manquants ou invalides');
          toast({ 
            title: "Lien invalide", 
            description: "Ce lien de réinitialisation n'est pas valide. Demandez un nouveau lien.", 
            variant: "destructive" 
          });
          setTimeout(() => navigate('/forgot-password'), 3000);
          setIsCheckingSession(false);
          return;
        }

        // Tenter de créer une session avec les tokens
        console.log('ResetPassword: Création de session avec les tokens');
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        });

        if (error) {
          console.error('ResetPassword: Erreur lors de la création de session:', error);
          let errorMessage = "Lien de réinitialisation invalide ou expiré.";
          
          if (error.message.includes('expired')) {
            errorMessage = "Le lien de réinitialisation a expiré.";
          } else if (error.message.includes('invalid')) {
            errorMessage = "Le lien de réinitialisation est invalide.";
          }
          
          toast({ 
            title: "Erreur", 
            description: errorMessage + " Demandez un nouveau lien.", 
            variant: "destructive" 
          });
          setTimeout(() => navigate('/forgot-password'), 3000);
        } else if (data?.session) {
          console.log('ResetPassword: Session créée avec succès');
          setIsReady(true);
          
          // Nettoyer l'URL pour retirer les tokens sensibles
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
        } else {
          console.log('ResetPassword: Aucune session créée malgré l\'absence d\'erreur');
          toast({ 
            title: "Erreur", 
            description: "Impossible de valider le lien. Demandez un nouveau lien.", 
            variant: "destructive" 
          });
          setTimeout(() => navigate('/forgot-password'), 3000);
        }
      } catch (error) {
        console.error('ResetPassword: Erreur inattendue:', error);
        toast({ 
          title: "Erreur", 
          description: "Une erreur est survenue. Veuillez réessayer.", 
          variant: "destructive" 
        });
        setTimeout(() => navigate('/forgot-password'), 3000);
      } finally {
        setIsCheckingSession(false);
      }
    };

    validateAndSetSession();
  }, [navigate, toast]);

  // Fonction pour mettre à jour le mot de passe
  const handleUpdatePassword = async (password: string, confirmPassword: string): Promise<boolean> => {
    if (!isReady) return false;
    
    console.log('ResetPassword: Début de la mise à jour du mot de passe');
    
    // Validation côté client
    if (password !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive"
      });
      return false;
    }

    if (password.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères.",
        variant: "destructive"
      });
      return false;
    }

    setIsLoading(true);

    try {
      // Vérifier qu'on a toujours une session valide
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error('ResetPassword: Session perdue pendant la mise à jour');
        toast({
          title: "Erreur",
          description: "Session expirée. Veuillez demander un nouveau lien.",
          variant: "destructive"
        });
        setTimeout(() => navigate('/forgot-password'), 2000);
        return false;
      }

      console.log('ResetPassword: Mise à jour du mot de passe avec Supabase');
      
      // Mettre à jour le mot de passe
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('ResetPassword: Erreur lors de la mise à jour:', error);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le mot de passe. Veuillez réessayer.",
          variant: "destructive"
        });
        return false;
      }

      console.log('ResetPassword: Mot de passe mis à jour avec succès');
      toast({
        title: "Succès !",
        description: "Votre mot de passe a été mis à jour avec succès."
      });

      // Déconnexion pour sécurité
      await supabase.auth.signOut();
      
      // Redirection vers la page de connexion
      setTimeout(() => {
        navigate('/login');
      }, 2000);

      return true;
      
    } catch (error: any) {
      console.error('ResetPassword: Erreur inattendue:', error);
      toast({
        title: "Erreur",
        description: "Une erreur inattendue s'est produite.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestNewLink = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <UnifiedPasswordResetForm 
          onSubmit={handleUpdatePassword}
          onRequestNewLink={handleRequestNewLink}
          isLoading={isLoading}
          isValidLink={isReady}
          isCheckingLink={isCheckingSession}
        />
      </div>
      
      <Footer />
    </div>
  );
};

export default ResetPassword;
