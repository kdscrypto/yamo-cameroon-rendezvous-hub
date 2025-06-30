
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
      console.log('PasswordResetFlow: Hash:', window.location.hash);
      console.log('PasswordResetFlow: Search:', window.location.search);

      try {
        // Extraire les tokens depuis l'URL (hash et search params)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const searchParams = new URLSearchParams(window.location.search);
        
        // Vérifier dans les deux endroits
        const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');
        const tokenType = hashParams.get('type') || searchParams.get('type');
        const errorParam = hashParams.get('error') || searchParams.get('error');
        const errorDescription = hashParams.get('error_description') || searchParams.get('error_description');

        console.log('PasswordResetFlow: Extracted tokens:', { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken, 
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

        // Si pas de token d'accès, considérer comme invalide
        if (!accessToken) {
          console.log('PasswordResetFlow: No access token found in URL');
          setIsValidLink(false);
          setIsCheckingLink(false);
          return;
        }

        // Essayer d'établir la session avec les tokens
        console.log('PasswordResetFlow: Attempting to set session with tokens');
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken || ''
        });

        if (sessionError) {
          console.error('PasswordResetFlow: Session validation failed:', sessionError);
          setIsValidLink(false);
        } else if (sessionData?.session && sessionData?.user) {
          console.log('PasswordResetFlow: Session validated successfully');
          console.log('PasswordResetFlow: User:', sessionData.user.email);
          setIsValidLink(true);
          
          // Nettoyer l'URL pour améliorer l'UX
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
        } else {
          console.log('PasswordResetFlow: No valid session or user found');
          setIsValidLink(false);
        }
      } catch (error) {
        console.error('PasswordResetFlow: Unexpected error during validation:', error);
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
