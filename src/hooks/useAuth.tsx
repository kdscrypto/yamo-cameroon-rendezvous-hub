
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

// Fonction utilitaire pour normaliser les numéros de téléphone
const normalizePhoneNumber = (phone: string): string => {
  // Supprime tous les espaces, tirets et parenthèses
  let normalized = phone.replace(/[\s\-\(\)]/g, '');
  
  // Si le numéro commence par 0, le remplace par +33
  if (normalized.startsWith('0')) {
    normalized = '+33' + normalized.substring(1);
  }
  
  // Si le numéro commence par 33 sans +, ajoute le +
  if (normalized.startsWith('33') && !normalized.startsWith('+33')) {
    normalized = '+' + normalized;
  }
  
  // Si le numéro ne commence pas par +, ajoute +33 par défaut (pour la France)
  if (!normalized.startsWith('+')) {
    normalized = '+33' + normalized;
  }
  
  return normalized;
};

// Validation stricte des numéros de téléphone
const isValidPhoneNumber = (phone: string): boolean => {
  const normalized = normalizePhoneNumber(phone);
  // Format international: +[code pays][numéro] (8 à 15 chiffres après le code pays)
  const phoneRegex = /^\+[1-9]\d{7,14}$/;
  return phoneRegex.test(normalized);
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true
  });

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth state changed:', event, session);
        setAuthState({
          user: session?.user ?? null,
          session: session,
          loading: false
        });
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthState({
        user: session?.user ?? null,
        session: session,
        loading: false
      });
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string, phone?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    // Validation et normalisation du numéro de téléphone si fourni
    let normalizedPhone: string | undefined = undefined;
    if (phone && phone.trim()) {
      if (!isValidPhoneNumber(phone)) {
        return { 
          data: null, 
          error: { message: "Le format du numéro de téléphone n'est pas valide." }
        };
      }
      normalizedPhone = normalizePhoneNumber(phone);
      
      // Vérifier si le numéro de téléphone existe déjà
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone', normalizedPhone)
        .maybeSingle();
      
      if (checkError) {
        console.error('Erreur lors de la vérification du téléphone:', checkError);
        return { 
          data: null, 
          error: { message: "Erreur lors de la vérification du numéro de téléphone." }
        };
      }
      
      if (existingProfile) {
        return { 
          data: null, 
          error: { message: "Ce numéro de téléphone est déjà utilisé." }
        };
      }
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          phone: normalizedPhone
        }
      }
    });

    // Si l'inscription réussit et qu'on a un numéro de téléphone, mettre à jour le profil
    if (!error && data.user && normalizedPhone) {
      try {
        // Attendre un peu que le trigger de création de profil se déclenche
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ phone: normalizedPhone })
          .eq('id', data.user.id);
        
        if (profileError) {
          console.error('Erreur lors de la mise à jour du profil avec le téléphone:', profileError);
          // On ne retourne pas d'erreur car l'inscription a réussi
        } else {
          console.log('Profil mis à jour avec le numéro de téléphone:', normalizedPhone);
        }
      } catch (profileUpdateError) {
        console.error('Erreur inattendue lors de la mise à jour du profil:', profileUpdateError);
        // On ne retourne pas d'erreur car l'inscription a réussi
      }
    }
    
    return { data, error };
  };

  const signIn = async (identifier: string, password: string) => {
    const cleanIdentifier = identifier.trim();
    
    // Détection améliorée des numéros de téléphone
    const isPhoneNumber = /^[\+0-9\s\-\(\)]{8,}$/.test(cleanIdentifier) && 
                         !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanIdentifier);
    
    console.log('Tentative de connexion:', { 
      identifier: cleanIdentifier, 
      isPhoneNumber,
      length: cleanIdentifier.length 
    });
    
    if (isPhoneNumber) {
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

  return {
    ...authState,
    signUp,
    signIn,
    signOut
  };
};
