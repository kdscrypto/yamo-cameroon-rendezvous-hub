
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useSimplePasswordReset = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const updatePassword = async (newPassword: string, confirmPassword: string): Promise<boolean> => {
    console.log('SimplePasswordReset: Starting password update');
    
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
      // Vérifier qu'on a une session valide
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !session) {
        console.error('SimplePasswordReset: No valid session found');
        toast({
          title: "Erreur",
          description: "Session invalide. Veuillez demander un nouveau lien.",
          variant: "destructive"
        });
        navigate('/forgot-password');
        return false;
      }

      console.log('SimplePasswordReset: Valid session found, updating password');
      
      // Mettre à jour le mot de passe
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        console.error('SimplePasswordReset: Password update failed:', error);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour le mot de passe. Veuillez réessayer.",
          variant: "destructive"
        });
        return false;
      }

      console.log('SimplePasswordReset: Password updated successfully');
      toast({
        title: "Succès !",
        description: "Votre mot de passe a été mis à jour avec succès."
      });

      // Déconnexion pour sécurité
      await supabase.auth.signOut();
      
      // Redirection vers la page de connexion
      setTimeout(() => {
        navigate('/login');
      }, 2000);

      return true;
      
    } catch (error: any) {
      console.error('SimplePasswordReset: Unexpected error:', error);
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
    updatePassword
  };
};
