
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
        } else {
          console.log('Profile updated with phone number:', phone);
        }
      }, 1000);
    }
    
    return { data, error };
  };

  const signIn = async (identifier: string, password: string) => {
    const cleanIdentifier = identifier.trim();
    
    // Enhanced phone number detection
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
    const isPhoneNumber = phoneRegex.test(cleanIdentifier);
    
    console.log('SignIn attempt:', { 
      identifier: cleanIdentifier, 
      isPhoneNumber,
      length: cleanIdentifier.length 
    });
    
    if (isPhoneNumber) {
      try {
        console.log('Looking up phone number in profiles:', cleanIdentifier);
        
        // First, try to find the email associated with this phone number
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email')
          .eq('phone', cleanIdentifier)
          .maybeSingle();
        
        console.log('Profile lookup result:', { profile, profileError });
        
        if (profileError) {
          console.error('Error looking up profile:', profileError);
          return { 
            data: null, 
            error: { message: "Erreur lors de la recherche du compte." }
          };
        }
        
        if (!profile?.email) {
          console.log('No profile found for phone number:', cleanIdentifier);
          return { 
            data: null, 
            error: { message: "Aucun compte trouvé avec ce numéro de téléphone." }
          };
        }
        
        console.log('Found email for phone number:', profile.email);
        
        // Use the found email to sign in
        const signInResult = await supabase.auth.signInWithPassword({
          email: profile.email,
          password
        });
        
        console.log('Phone login result:', signInResult);
        return signInResult;
        
      } catch (error) {
        console.error('Phone login error:', error);
        return { 
          data: null, 
          error: { message: "Erreur lors de la connexion avec le téléphone." }
        };
      }
    } else {
      // Sign in with email
      console.log('Attempting email login with:', cleanIdentifier);
      const signInResult = await supabase.auth.signInWithPassword({
        email: cleanIdentifier,
        password
      });
      
      console.log('Email login result:', signInResult);
      return signInResult;
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out user...');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erreur lors de la déconnexion:', error);
      } else {
        console.log('User signed out successfully');
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
