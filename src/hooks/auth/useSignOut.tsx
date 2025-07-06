
import { supabase } from '@/integrations/supabase/client';

export const useSignOut = () => {
  const signOut = async () => {
    try {
      console.log('Déconnexion de l\'utilisateur...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erreur lors de la déconnexion:', error);
      } else {
        console.log('Utilisateur déconnecté avec succès');
      }
      return { error };
    } catch (error) {
      console.error('Erreur inattendue lors de la déconnexion:', error);
      return { error };
    }
  };

  return { signOut };
};
