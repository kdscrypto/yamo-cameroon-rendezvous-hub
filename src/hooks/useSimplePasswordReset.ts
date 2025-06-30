
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
    // Cette fonction s'exécute une seule fois au chargement de la page.
    const handleRecovery = async () => {
      // Étape 1 : Lire manuellement le token depuis l'URL (depuis le fragment #).
      // On s'assure de gérer aussi le format avec '?' au cas où.
      const params = new URLSearchParams(window.location.hash.substring(1) || window.location.search);
      const accessToken = params.get('access_token');

      // Si aucun token n'est trouvé, le lien est invalide.
      if (!accessToken) {
        console.error('No access token found in URL.');
        setIsReadyForUpdate(false); // Garder le formulaire désactivé
        setIsCheckingTokens(false);
        return;
      }
      
      console.log('Token found, attempting manual verification...');

      try {
        // Étape 2 : Envoyer manuellement le token à Supabase pour vérification.
        const { data, error } = await supabase.auth.verifyOtp({
          token: accessToken,
          type: 'recovery',
        });

        // Étape 3 : Gérer la réponse de Supabase.
        if (error) {
          // Si Supabase retourne une erreur, le token est vraiment invalide ou expiré.
          console.error('Supabase token verification failed:', error.message);
          setIsReadyForUpdate(false);
          setIsCheckingTokens(false);
        } else {
          // Si aucune erreur n'est retournée, le token est bon !
          // Supabase a créé une session valide. Nous sommes prêts.
          console.log('Token successfully verified! Ready for password update.');
          setIsReadyForUpdate(true); // Autoriser la mise à jour !
          setIsCheckingTokens(false);
        }
      } catch (e) {
        console.error('An unexpected error occurred during verification:', e);
        setIsReadyForUpdate(false);
        setIsCheckingTokens(false);
      }
    };

    handleRecovery();
  }, []); // Le tableau de dépendances est vide pour ne l'exécuter qu'une fois.

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
