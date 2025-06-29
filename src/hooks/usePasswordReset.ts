
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const usePasswordReset = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const handlePasswordReset = async () => {
      console.log('ResetPassword: Starting password reset validation');
      console.log('ResetPassword: Current URL:', window.location.href);
      console.log('ResetPassword: Search params:', window.location.search);
      console.log('ResetPassword: Hash:', window.location.hash);
      
      try {
        // Vérifier d'abord s'il y a déjà une session valide
        const { data: { session: existingSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (existingSession && !sessionError) {
          console.log('ResetPassword: Session existante trouvée');
          setIsValidSession(true);
          setIsCheckingSession(false);
          return;
        }

        let accessToken = null;
        let refreshToken = null;
        let type = null;

        // Méthode 1: Vérifier les fragments d'URL (hash) - format principal de Supabase
        const hashFragment = window.location.hash.substring(1);
        console.log('ResetPassword: Hash fragment:', hashFragment);
        
        if (hashFragment) {
          const hashParams = new URLSearchParams(hashFragment);
          accessToken = hashParams.get('access_token');
          refreshToken = hashParams.get('refresh_token');
          type = hashParams.get('type');
          
          console.log('ResetPassword: Tokens trouvés dans le hash:', { 
            hasAccessToken: !!accessToken, 
            hasRefreshToken: !!refreshToken, 
            type 
          });
        }

        // Méthode 2: Vérifier les paramètres de requête si pas de hash
        if (!accessToken || !type) {
          const searchParams = new URLSearchParams(window.location.search);
          const queryAccessToken = searchParams.get('access_token');
          const queryRefreshToken = searchParams.get('refresh_token');
          const queryType = searchParams.get('type');
          
          if (queryAccessToken && queryType) {
            accessToken = queryAccessToken;
            refreshToken = queryRefreshToken;
            type = queryType;
            
            console.log('ResetPassword: Tokens trouvés dans les query params:', { 
              hasAccessToken: !!accessToken, 
              hasRefreshToken: !!refreshToken, 
              type 
            });
          }
        }

        // Validation des tokens
        if (!accessToken) {
          console.log('ResetPassword: Aucun access_token trouvé');
          throw new Error('Aucun token d\'accès trouvé dans l\'URL');
        }

        if (type !== 'recovery') {
          console.log('ResetPassword: Type incorrect:', type);
          throw new Error(`Type de token incorrect: ${type}. Attendu: recovery`);
        }

        console.log('ResetPassword: Tentative de définition de la session avec les tokens...');
        
        // Définir la session avec les tokens
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        });

        if (error) {
          console.error('ResetPassword: Erreur lors de la définition de la session:', error);
          throw new Error(`Erreur de session: ${error.message}`);
        }

        if (!data.session) {
          console.error('ResetPassword: Aucune session créée');
          throw new Error('Impossible de créer une session avec les tokens fournis');
        }

        console.log('ResetPassword: Session définie avec succès:', data);
        setIsValidSession(true);
        
        // Nettoyer l'URL pour retirer les tokens sensibles
        const cleanUrl = new URL(window.location.href);
        cleanUrl.hash = '';
        cleanUrl.searchParams.delete('access_token');
        cleanUrl.searchParams.delete('refresh_token');
        cleanUrl.searchParams.delete('type');
        
        // Garder les autres paramètres s'il y en a
        const cleanSearch = cleanUrl.searchParams.toString();
        const finalUrl = cleanUrl.pathname + (cleanSearch ? '?' + cleanSearch : '');
        
        window.history.replaceState({}, document.title, finalUrl);
        
      } catch (error: any) {
        console.error('ResetPassword: Erreur pendant la validation:', error);
        setIsValidSession(false);
        
        // Messages d'erreur plus spécifiques
        let errorMessage = "Le lien de réinitialisation est invalide ou a expiré.";
        let errorTitle = "Lien invalide";
        
        if (error.message.includes('expired')) {
          errorMessage = "Le lien de réinitialisation a expiré. Veuillez demander un nouveau lien.";
          errorTitle = "Lien expiré";
        } else if (error.message.includes('invalid')) {
          errorMessage = "Le lien de réinitialisation est invalide. Veuillez demander un nouveau lien.";
          errorTitle = "Lien invalide";
        } else if (error.message.includes('Token')) {
          errorMessage = "Les informations de sécurité sont manquantes ou incorrectes.";
          errorTitle = "Erreur de sécurité";
        }
        
        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive"
        });
        
        // Redirection après l'erreur
        setTimeout(() => {
          navigate('/forgot-password');
        }, 3000);
      } finally {
        setIsCheckingSession(false);
      }
    };

    handlePasswordReset();
  }, [navigate, toast]);

  const updatePassword = async (password: string, confirmPassword: string) => {
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
      console.log('ResetPassword: Mise à jour du mot de passe...');
      
      // Vérifier que nous avons toujours une session valide
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Session expirée. Veuillez cliquer à nouveau sur le lien de réinitialisation.');
      }
      
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('ResetPassword: Erreur lors de la mise à jour du mot de passe:', error);
        throw error;
      }

      console.log('ResetPassword: Mot de passe mis à jour avec succès');
      toast({
        title: "Mot de passe modifié",
        description: "Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter."
      });
      
      // Déconnecter l'utilisateur pour qu'il puisse se connecter avec son nouveau mot de passe
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
        description: error.message || "Une erreur inattendue s'est produite.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    isValidSession,
    isCheckingSession,
    updatePassword
  };
};
