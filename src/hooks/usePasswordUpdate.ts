
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { validatePasswordResetTokens } from '@/utils/tokenValidation';

export const usePasswordUpdate = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const updatePassword = async (password: string, confirmPassword: string): Promise<boolean> => {
    // Validation côté client
    if (password !== confirmPassword) {
      toast({
        title: "Erreur de validation",
        description: "Les mots de passe ne correspondent pas.",
        variant: "destructive"
      });
      return false;
    }

    if (password.length < 6) {
      toast({
        title: "Erreur de validation",
        description: "Le mot de passe doit contenir au moins 6 caractères.",
        variant: "destructive"
      });
      return false;
    }

    setIsLoading(true);

    try {
      console.log('PasswordUpdate: Starting password update process...');
      
      // Valider et configurer la session avec les tokens de l'URL
      const tokenValidation = await validatePasswordResetTokens();
      
      if (!tokenValidation.isValid) {
        console.error('PasswordUpdate: Token validation failed:', tokenValidation.error);
        toast({
          title: "Lien invalide",
          description: tokenValidation.error || "Le lien de réinitialisation n'est pas valide.",
          variant: "destructive"
        });
        
        // Rediriger vers la page de demande de nouveau lien après 3 secondes
        setTimeout(() => {
          navigate('/forgot-password');
        }, 3000);
        
        return false;
      }
      
      console.log('PasswordUpdate: Token validation successful, updating password...');
      
      // Vérifier qu'on a maintenant une session valide
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Aucune session active après validation des tokens');
      }
      
      // Mettre à jour le mot de passe
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error('PasswordUpdate: Supabase update error:', error);
        
        // Gestion spécifique des erreurs Supabase
        let errorMessage = "La mise à jour du mot de passe a échoué.";
        
        if (error.message.includes('password')) {
          errorMessage = "Le mot de passe ne respecte pas les critères de sécurité.";
        } else if (error.message.includes('session')) {
          errorMessage = "Session expirée. Veuillez demander un nouveau lien.";
        }
        
        toast({
          title: "Erreur de mise à jour",
          description: errorMessage,
          variant: "destructive"
        });
        return false;
      }

      console.log('PasswordUpdate: Password updated successfully');
      toast({
        title: "Succès !",
        description: "Votre mot de passe a été mis à jour avec succès."
      });
      
      // Déconnecter l'utilisateur pour sécurité
      await supabase.auth.signOut();
      
      // Rediriger vers la page de connexion
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
      return true;
      
    } catch (error: any) {
      console.error('PasswordUpdate: Unexpected error:', error);
      
      let errorMessage = "Une erreur inattendue s'est produite.";
      
      if (error.message.includes('session')) {
        errorMessage = "Session invalide. Veuillez demander un nouveau lien de réinitialisation.";
      } else if (error.message.includes('network')) {
        errorMessage = "Erreur de connexion. Vérifiez votre connexion internet.";
      }
      
      toast({
        title: "Erreur",
        description: errorMessage,
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
