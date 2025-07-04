
import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

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
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          phone: phone
        }
      }
    });

    // If signup is successful and we have a phone number, update the profile
    if (!error && data.user && phone) {
      setTimeout(async () => {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ phone: phone })
          .eq('id', data.user!.id);
        
        if (profileError) {
          console.error('Error updating profile with phone:', profileError);
        }
      }, 1000);
    }
    
    return { data, error };
  };

  const signIn = async (identifier: string, password: string) => {
    // Check if identifier is a phone number (starts with + or contains only digits and spaces/dashes)
    const isPhoneNumber = /^[\+]?[0-9\s\-\(\)]+$/.test(identifier.trim());
    
    if (isPhoneNumber) {
      // First, try to find the email associated with this phone number
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('phone', identifier.trim())
        .single();
      
      if (profileError || !profile?.email) {
        return { 
          data: null, 
          error: { message: "Aucun compte trouvé avec ce numéro de téléphone." }
        };
      }
      
      // Use the found email to sign in
      return await supabase.auth.signInWithPassword({
        email: profile.email,
        password
      });
    } else {
      // Sign in with email
      return await supabase.auth.signInWithPassword({
        email: identifier,
        password
      });
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erreur lors de la déconnexion:', error);
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
