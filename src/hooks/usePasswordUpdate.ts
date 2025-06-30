
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const usePasswordUpdate = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

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
      console.log('PasswordUpdate: Updating password...');
      
      // Verify we still have a valid session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Session expirée. Veuillez cliquer à nouveau sur le lien de réinitialisation.');
      }
      
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('PasswordUpdate: Error updating password:', error);
        throw error;
      }

      console.log('PasswordUpdate: Password updated successfully');
      toast({
        title: "Mot de passe modifié",
        description: "Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter."
      });
      
      // Sign out user so they can login with new password
      await supabase.auth.signOut();
      
      // Redirect to login page
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
      return true;
    } catch (error: any) {
      console.error('PasswordUpdate: Unexpected error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur inattendue s'est produite.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    updatePassword,
    isLoading
  };
};
