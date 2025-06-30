
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
      console.log('PasswordResetFlow: Starting link validation');
      console.log('PasswordResetFlow: Current URL:', window.location.href);

      try {
        // Vérifier s'il y a des tokens dans l'URL (hash ou search params)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const searchParams = new URLSearchParams(window.location.search);
        
        const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');
        const tokenType = hashParams.get('type') || searchParams.get('type');

        console.log('PasswordResetFlow: Tokens found:', { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken, 
          type: tokenType 
        });

        if (!accessToken) {
          console.log('PasswordResetFlow: No access token found');
          setIsValidLink(false);
          setIsCheckingLink(false);
          return;
        }

        // Utiliser setSession pour valider et établir la session
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        });

        if (error) {
          console.error('PasswordResetFlow: Session validation failed:', error);
          setIsValidLink(false);
        } else {
          console.log('PasswordResetFlow: Session validated successfully');
          setIsValidLink(true);
          
          // Nettoyer l'URL pour améliorer l'UX
          window.history.replaceState({}, '', window.location.pathname);
        }
      } catch (error) {
        console.error('PasswordResetFlow: Unexpected error:', error);
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
        console.error('PasswordResetFlow: No valid session found');
        toast({
          title: "Erreur",
          description: "Session invalide. Veuillez demander un nouveau lien.",
          variant: "destructive"
        });
        setTimeout(() => navigate('/forgot-password'), 2000);
        return false;
      }

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
