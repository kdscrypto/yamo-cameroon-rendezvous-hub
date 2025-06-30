
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { validatePasswordResetTokens } from '@/utils/tokenValidation';

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
      console.log('PasswordUpdate: Tentative de mise à jour du mot de passe...');
      
      // D'abord, essayer de valider et configurer la session avec les tokens de l'URL
      const tokenValidation = await validatePasswordResetTokens();
      
      if (!tokenValidation.isValid) {
        console.error('PasswordUpdate: Tokens invalides:', tokenValidation.error);
        toast({
          title: "Lien invalide ou expiré",
          description: "Le lien de réinitialisation n'est plus valide. Veuillez demander un nouveau lien.",
          variant: "destructive"
        });
        
        // Rediriger vers la page de demande de réinitialisation
        setTimeout(() => {
          navigate('/forgot-password');
        }, 3000);
        
        return false;
      }
      
      // Vérifier qu'on a maintenant une session valide
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Impossible de créer une session. Veuillez cliquer à nouveau sur le lien de réinitialisation.');
      }
      
      // Maintenant on peut mettre à jour le mot de passe
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('PasswordUpdate: Erreur lors de la mise à jour:', error);
        throw error;
      }

      console.log('PasswordUpdate: Mot de passe mis à jour avec succès');
      toast({
        title: "Mot de passe modifié",
        description: "Votre mot de passe a été mis à jour avec succès. Vous pouvez maintenant vous connecter."
      });
      
      // Déconnecter l'utilisateur pour qu'il puisse se connecter avec le nouveau mot de passe
      await supabase.auth.signOut();
      
      // Rediriger vers la page de connexion
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
      return true;
    } catch (error: any) {
      console.error('PasswordUpdate: Erreur inattendue:', error);
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
