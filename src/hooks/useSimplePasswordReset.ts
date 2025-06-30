
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
    // --- Début du correctif : Forcer le bon format d'URL ---
    const searchParams = new URLSearchParams(window.location.search);
    const accessToken = searchParams.get('access_token');
    const type = searchParams.get('type');

    // Si l'URL est au mauvais format (?type=recovery)
    if (accessToken && type === 'recovery') {
      // On la reconstruit avec le bon format (#) que Supabase peut lire.
      const fragment = new URLSearchParams({
        access_token: accessToken,
        type: type,
      }).toString();
      
      // On remplace l'URL et on recharge la page.
      // Le rechargement est crucial pour que Supabase s'initialise correctement.
      window.history.replaceState(null, '', '#' + fragment);
      window.location.reload();
      return; // On arrête l'exécution ici, le reste s'exécutera après le rechargement.
    }
    // --- Fin du correctif ---

    // Ce code s'exécutera seulement après que l'URL ait été corrigée.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change detected:', event);

        // Une fois l'URL correcte, Supabase enverra un de ces signaux.
        if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
          console.log('Valid recovery session detected. Ready for update.');
          // On autorise la mise à jour !
          setIsReadyForUpdate(true);
          setIsCheckingTokens(false);
        } else {
          // Si un autre événement se produit, nous restons en état non prêt.
          setIsCheckingTokens(false);
        }
      }
    );

    // La fonction de nettoyage.
    return () => {
      subscription.unsubscribe();
    };
  }, []); // Le tableau de dépendances est vide.

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
