
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const usePasswordResetFlow = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isValidLink, setIsValidLink] = useState<boolean | null>(null);
  const [isCheckingLink, setIsCheckingLink] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const validateResetLink = async () => {
      console.log('PasswordResetFlow: Starting manual token validation');
      console.log('PasswordResetFlow: Current URL:', window.location.href);
      console.log('PasswordResetFlow: Hash:', window.location.hash);

      try {
        // Étape 1 : Extraire le token manuellement depuis le fragment (#) de l'URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const tokenType = hashParams.get('type');
        const errorParam = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        console.log('PasswordResetFlow: Manual token extraction:', { 
          hasAccessToken: !!accessToken, 
          type: tokenType,
          error: errorParam,
          errorDescription: errorDescription
        });

        // Vérifier s'il y a une erreur dans l'URL
        if (errorParam) {
          console.error('PasswordResetFlow: Error in URL:', errorParam, errorDescription);
          setIsValidLink(false);
          setIsCheckingLink(false);
          return;
        }

        // Si aucun token d'accès n'est trouvé, le lien est invalide
        if (!accessToken) {
          console.log('PasswordResetFlow: No access token found in URL fragment');
          setIsValidLink(false);
          setIsCheckingLink(false);
          return;
        }

        // Étape 2 : Validation manuelle du token avec verifyOtp
        console.log('PasswordResetFlow: Attempting manual token verification with verifyOtp');
        const { data, error } = await supabase.auth.verifyOtp({
          token: accessToken,
          type: 'recovery'
        });

        if (error) {
          console.error('PasswordResetFlow: Token verification failed:', error);
          setIsValidLink(false);
        } else if (data?.user && data?.session) {
          console.log('PasswordResetFlow: Token verified successfully');
          console.log('PasswordResetFlow: User:', data.user.email);
          setIsValidLink(true);
          
          // Nettoyer l'URL pour améliorer l'UX
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
        } else {
          console.log('PasswordResetFlow: Token verification returned no valid session');
          setIsValidLink(false);
        }
      } catch (error) {
        console.error('PasswordResetFlow: Unexpected error during manual validation:', error);
        setIsValidLink(false);
      } finally {
        setIsCheckingLink(false);
      }
    };

    validateResetLink();
  }, []);

  const updatePassword = async (newPassword: string, confirmPassword: string): Promise<boolean> => {
    console.log('PasswordResetFlow: Starting password update');
    
    // Validation côté client
    if (newPassword !== confirmPassword) {
      toast({
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive"
      });
      return false;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erreur",
        description: "Le mot de passe doit contenir au moins 6 caractères.",
        variant: "destructive"
      });
      return false;
    }

    setIsLoading(true);

    try {
      // Vérifier qu'on a une session active
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('PasswordResetFlow: No valid session found for password update');
        toast({
          title: "Erreur",
          description: "Session invalide. Veuillez demander un nouveau lien.",
          variant: "destructive"
        });
        setTimeout(() => navigate('/forgot-password'), 2000);
        return false;
      }

      console.log('PasswordResetFlow: Valid session found, updating password');
      
      // Mettre à jour le mot de passe
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('PasswordResetFlow: Password update failed:', error);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le mot de passe. Veuillez réessayer.",
          variant: "destructive"
        });
        return false;
      }

      console.log('PasswordResetFlow: Password updated successfully');
      toast({
        title: "Succès !",
        description: "Votre mot de passe a été mis à jour avec succès."
      });

      // Déconnecter l'utilisateur pour sécurité
      await supabase.auth.signOut();
      
      // Rediriger vers la page de connexion
      setTimeout(() => {
        navigate('/login');
      }, 2000);

      return true;
      
    } catch (error: any) {
      console.error('PasswordResetFlow: Unexpected error:', error);
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

  const requestNewLink = () => {
    navigate('/forgot-password');
  };

  return {
    isLoading,
    isValidLink,
    isCheckingLink,
    updatePassword,
    requestNewLink
  };
};
