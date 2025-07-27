
import { useAuthState, AuthState } from './auth/useAuthState';
import { useSignUp } from './auth/useSignUp';
import { useSignIn } from './auth/useSignIn';
import { useSignOut } from './auth/useSignOut';
import { useSecurityMonitoring } from './useSecurityMonitoring';
import { useCallback } from 'react';

export type { AuthState };

export const useAuth = () => {
  const authState = useAuthState();
  const { signUp } = useSignUp();
  const { signIn } = useSignIn();
  const { signOut } = useSignOut();
  const { analyzeRequest } = useSecurityMonitoring();

  // Enhanced sign in with security monitoring
  const secureSignIn = useCallback(async (email: string, password: string) => {
    // Analyze the authentication request for threats
    const securityResult = analyzeRequest({
      url: '/auth/signin',
      method: 'POST',
      body: { email },
      userAgent: navigator.userAgent,
      ip: undefined // Will be determined server-side
    });

    if (!securityResult.safe) {
      console.warn('Security threats detected during sign in:', securityResult.threats);
    }

    return signIn(email, password);
  }, [signIn, analyzeRequest]);

  // Enhanced sign up with security monitoring
  const secureSignUp = useCallback(async (
    email: string, 
    password: string, 
    fullName?: string, 
    phone?: string, 
    referralCode?: string
  ) => {
    // Analyze the registration request for threats
    const securityResult = analyzeRequest({
      url: '/auth/signup',
      method: 'POST',
      body: { email, fullName, phone, referralCode },
      userAgent: navigator.userAgent,
      ip: undefined // Will be determined server-side
    });

    if (!securityResult.safe) {
      console.warn('Security threats detected during sign up:', securityResult.threats);
    }

    return signUp(email, password, fullName, phone, referralCode);
  }, [signUp, analyzeRequest]);

  return {
    ...authState,
    signUp: secureSignUp,
    signIn: secureSignIn,
    signOut
  };
};
