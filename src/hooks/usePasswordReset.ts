
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
        // Method 1: Check for existing valid session first
        const { data: { session: existingSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (existingSession && !sessionError) {
          console.log('ResetPassword: Found existing valid session');
          setIsValidSession(true);
          setIsCheckingSession(false);
          return;
        }

        // Method 2: Check URL fragments (hash)
        const hashFragment = window.location.hash.substring(1);
        console.log('ResetPassword: Hash fragment:', hashFragment);
        
        let accessToken = null;
        let refreshToken = null;
        let type = null;

        if (hashFragment) {
          const hashParams = new URLSearchParams(hashFragment);
          accessToken = hashParams.get('access_token');
          refreshToken = hashParams.get('refresh_token');
          type = hashParams.get('type');
          
          console.log('ResetPassword: Hash params found:', { 
            hasAccessToken: !!accessToken, 
            hasRefreshToken: !!refreshToken, 
            type 
          });
        }

        // Method 3: Check query parameters if hash didn't work
        if (!accessToken) {
          const searchParams = new URLSearchParams(window.location.search);
          accessToken = searchParams.get('access_token');
          refreshToken = searchParams.get('refresh_token');
          type = searchParams.get('type');
          
          console.log('ResetPassword: Query params found:', { 
            hasAccessToken: !!accessToken, 
            hasRefreshToken: !!refreshToken, 
            type 
          });
        }

        if (accessToken && type === 'recovery') {
          console.log('ResetPassword: Setting session with recovery tokens...');
          
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });

          if (error) {
            console.error('ResetPassword: Session error:', error);
            throw new Error(`Erreur de session: ${error.message}`);
          }

          console.log('ResetPassword: Session set successfully:', data);
          setIsValidSession(true);
          
          // Clean up the URL to remove tokens
          const cleanUrl = new URL(window.location.href);
          cleanUrl.hash = '';
          cleanUrl.search = '';
          window.history.replaceState({}, document.title, cleanUrl.pathname);
          
        } else {
          console.log('ResetPassword: No valid recovery tokens found');
          console.log('ResetPassword: Access token present:', !!accessToken);
          console.log('ResetPassword: Type:', type);
          
          throw new Error('Lien de réinitialisation invalide ou expiré');
        }

      } catch (error) {
        console.error('ResetPassword: Error during validation:', error);
        setIsValidSession(false);
        
        toast({
          title: "Lien invalide",
          description: "Le lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien.",
          variant: "destructive"
        });
        
        // Redirect after showing the error
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
      console.log('ResetPassword: Updating password...');
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('ResetPassword: Error updating password:', error);
        toast({
          title: "Erreur",
          description: error.message,
          variant: "destructive"
        });
        return false;
      } else {
        console.log('ResetPassword: Password updated successfully');
        toast({
          title: "Mot de passe modifié",
          description: "Votre mot de passe a été mis à jour avec succès."
        });
        
        // Sign out the user so they can log in with their new password
        await supabase.auth.signOut();
        navigate('/login');
        return true;
      }
    } catch (error) {
      console.error('ResetPassword: Unexpected error:', error);
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

  return {
    isLoading,
    isValidSession,
    isCheckingSession,
    updatePassword
  };
};
