
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useSimplePasswordReset = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isReadyForUpdate, setIsReadyForUpdate] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('SimplePasswordReset: Initializing...');
    
    const checkForPasswordResetTokens = async () => {
      try {
        // Vérifier s'il y a des tokens dans l'URL (hash ou query params)
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        const accessToken = urlParams.get('access_token') || hashParams.get('access_token');
        const refreshToken = urlParams.get('refresh_token') || hashParams.get('refresh_token');
        const type = urlParams.get('type') || hashParams.get('type');
        
        console.log('SimplePasswordReset: Checking tokens...', { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken, 
          type 
        });
        
        if (accessToken && type === 'recovery') {
          console.log('SimplePasswordReset: Recovery tokens found, setting session...');
          
          // Définir la session avec les tokens
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });
          
          if (error) {
            console.error('SimplePasswordReset: Error setting session:', error);
            toast({
              title: "Erreur",
              description: "Lien de réinitialisation invalide ou expiré.",
              variant: "destructive"
            });
            setTimeout(() => {
              navigate('/forgot-password');
            }, 3000);
            return;
          }
          
          console.log('SimplePasswordReset: Session set successfully, ready for password update!');
          setIsReadyForUpdate(true);
        } else {
          console.log('SimplePasswordReset: No valid recovery tokens found');
          toast({
            title: "Lien manquant",
            description: "Aucun lien de réinitialisation valide détecté.",
            variant: "destructive"
          });
          setTimeout(() => {
            navigate('/forgot-password');
          }, 3000);
        }
      } catch (error) {
        console.error('SimplePasswordReset: Error during token check:', error);
        toast({
          title: "Erreur",
          description: "Erreur lors de la validation du lien.",
          variant: "destructive"
        });
        setTimeout(() => {
          navigate('/forgot-password');
        }, 3000);
      }
    };

    // Vérifier immédiatement les tokens au chargement
    checkForPasswordResetTokens();
    
    // Configurer l'écoute des changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('SimplePasswordReset: Auth state change:', event, session);
        
        if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
          console.log('SimplePasswordReset: Password recovery session active!');
          setIsReadyForUpdate(true);
        }
      }
    );

    return () => {
      console.log('SimplePasswordReset: Cleaning up auth listener...');
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  const updatePassword = async (password: string, confirmPassword: string): Promise<boolean> => {
    console.log('SimplePasswordReset: Starting password update...');
    
    // Simple client-side validation
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
      console.log('SimplePasswordReset: Calling supabase.auth.updateUser...');
      
      // Vérifier qu'on a une session active
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Aucune session active');
      }
      
      // Direct call to Supabase - no complex token validation
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('SimplePasswordReset: Supabase error:', error);
        toast({
          title: "Erreur",
          description: "La mise à jour a échoué. Veuillez réessayer.",
          variant: "destructive"
        });
        return false;
      }

      console.log('SimplePasswordReset: Password updated successfully!');
      
      toast({
        title: "Succès !",
        description: "Votre mot de passe a été mis à jour avec succès."
      });
      
      // Déconnecter l'utilisateur pour sécurité
      await supabase.auth.signOut();
      
      // Navigate to login page after success
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
      return true;
      
    } catch (error: any) {
      console.error('SimplePasswordReset: Unexpected error:', error);
      toast({
        title: "Erreur",
        description: "La mise à jour a échoué. Veuillez réessayer.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updatePassword,
    isLoading,
    isReadyForUpdate
  };
};
