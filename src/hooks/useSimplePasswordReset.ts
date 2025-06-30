
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useSimplePasswordReset = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isReadyForUpdate, setIsReadyForUpdate] = useState(false);
  const [isCheckingTokens, setIsCheckingTokens] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('SimplePasswordReset: Initializing...');
    
    // Donner du temps à Supabase pour traiter les tokens naturellement
    const initTimeout = setTimeout(() => {
      checkTokensAndSession();
    }, 1000); // Attendre 1 seconde pour laisser Supabase traiter
    
    // Configurer l'écoute des changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('SimplePasswordReset: Auth state change:', event, session);
        
        if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
          console.log('SimplePasswordReset: Password recovery session active!');
          setIsReadyForUpdate(true);
          setIsCheckingTokens(false);
        }
      }
    );

    const checkTokensAndSession = async () => {
      try {
        console.log('SimplePasswordReset: Checking for valid session...');
        
        // Vérifier s'il y a des tokens dans l'URL
        const urlParams = new URLSearchParams(window.location.search);
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        
        const accessToken = urlParams.get('access_token') || hashParams.get('access_token');
        const type = urlParams.get('type') || hashParams.get('type');
        
        console.log('SimplePasswordReset: URL tokens check:', { 
          hasAccessToken: !!accessToken, 
          type,
          fullURL: window.location.href
        });
        
        // Si on a des tokens de récupération dans l'URL, attendre que Supabase les traite
        if (accessToken && type === 'recovery') {
          console.log('SimplePasswordReset: Recovery tokens found, waiting for Supabase to process...');
          setIsCheckingTokens(false);
          setIsReadyForUpdate(true);
          return;
        }
        
        // Sinon, vérifier s'il y a déjà une session active
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (session && session.user) {
          console.log('SimplePasswordReset: Active session found, ready for password update!');
          setIsReadyForUpdate(true);
          setIsCheckingTokens(false);
        } else {
          console.log('SimplePasswordReset: No valid session or tokens found');
          setIsCheckingTokens(false);
          
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
        console.error('SimplePasswordReset: Error during session check:', error);
        setIsCheckingTokens(false);
        
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

    return () => {
      console.log('SimplePasswordReset: Cleaning up...');
      clearTimeout(initTimeout);
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
    isReadyForUpdate,
    isCheckingTokens
  };
};
