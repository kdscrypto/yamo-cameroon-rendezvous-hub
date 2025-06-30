
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

      try {
        // Extract parameters from URL hash
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const tokenType = hashParams.get('type');
        const errorParam = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        console.log('PasswordResetFlow: URL parameters:', { 
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken, 
          type: tokenType,
          error: errorParam,
          errorDescription: errorDescription
        });

        // Check for errors in URL
        if (errorParam) {
          console.error('PasswordResetFlow: Error in URL:', errorParam, errorDescription);
          setIsValidLink(false);
          setIsCheckingLink(false);
          return;
        }

        // Validate that we have the required tokens
        if (!accessToken || !refreshToken) {
          console.log('PasswordResetFlow: Missing required tokens in URL');
          setIsValidLink(false);
          setIsCheckingLink(false);
          return;
        }

        // Set the session with the tokens
        console.log('PasswordResetFlow: Setting session with tokens');
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (error) {
          console.error('PasswordResetFlow: Session setup failed:', error);
          setIsValidLink(false);
        } else if (data?.session && data?.user) {
          console.log('PasswordResetFlow: Session established successfully');
          console.log('PasswordResetFlow: User:', data.user.email);
          setIsValidLink(true);
          
          // Clean up URL for better UX
          const cleanUrl = window.location.pathname;
          window.history.replaceState({}, '', cleanUrl);
        } else {
          console.log('PasswordResetFlow: Session setup returned no valid session');
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
    
    // Client-side validation
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
      // Verify we have a valid session
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
      
      // Update the password
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

      // Sign out for security
      await supabase.auth.signOut();
      
      // Redirect to login page
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
