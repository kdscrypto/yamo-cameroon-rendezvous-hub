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
    // La seule source de vérité est l'écouteur d'état d'authentification de Supabase.
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state change detected:', event);

        // LIGNE CORRIGÉE : Accepter SIGNED_IN comme un événement valide pour la récupération.
        // Lorsque l'utilisateur clique sur le lien, Supabase crée une session temporaire valide.
        if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
          console.log('Valid recovery session detected. Ready for update.');
          setIsReadyForUpdate(true); // Autoriser la mise à jour
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
