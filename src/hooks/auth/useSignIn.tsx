
import { supabase } from '@/integrations/supabase/client';
import { normalizePhoneNumber, isPhoneNumberFormat } from '@/utils/phoneUtils';

export const useSignIn = () => {
  const signIn = async (identifier: string, password: string) => {
    const cleanIdentifier = identifier.trim();
    
    console.log('Tentative de connexion:', { 
      identifier: cleanIdentifier, 
      isPhoneNumber: isPhoneNumberFormat(cleanIdentifier),
      length: cleanIdentifier.length 
    });
    
    if (isPhoneNumberFormat(cleanIdentifier)) {
      try {
        const normalizedPhone = normalizePhoneNumber(cleanIdentifier);
        console.log('Recherche du numéro de téléphone normalisé:', normalizedPhone);
        
        // Chercher l'email associé à ce numéro de téléphone
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('phone', normalizedPhone)
          .maybeSingle();
        
        console.log('Résultat de la recherche de profil:', { profile, profileError });
        
        if (profileError) {
          console.error('Erreur lors de la recherche du profil:', profileError);
          return { 
            data: null, 
            error: { message: "Erreur lors de la recherche du compte." }
          };
        }
        
        if (!profile?.email) {
          console.log('Aucun profil trouvé pour le numéro de téléphone:', normalizedPhone);
          return { 
            data: null, 
            error: { message: "Aucun compte trouvé avec ce numéro de téléphone." }
          };
        }
        
        console.log('Email trouvé pour le numéro de téléphone:', profile.email);
        
        // Utiliser l'email trouvé pour se connecter
        const signInResult = await supabase.auth.signInWithPassword({
          email: profile.email,
          password
        });
        
        console.log('Résultat de la connexion par téléphone:', signInResult);
        return signInResult;
        
      } catch (error) {
        console.error('Erreur de connexion par téléphone:', error);
        return { 
          data: null, 
          error: { message: "Erreur lors de la connexion avec le téléphone." }
        };
      }
    } else {
      // Connexion avec email
      console.log('Tentative de connexion par email avec:', cleanIdentifier);
      const signInResult = await supabase.auth.signInWithPassword({
        email: cleanIdentifier,
        password
      });
      
      console.log('Résultat de la connexion par email:', signInResult);
      return signInResult;
    }
  };

  return { signIn };
};
