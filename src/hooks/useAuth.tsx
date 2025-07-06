
import { useAuthState, AuthState } from './auth/useAuthState';
import { useSignUp } from './auth/useSignUp';
import { useSignIn } from './auth/useSignIn';
import { useSignOut } from './auth/useSignOut';

export type { AuthState };

export const useAuth = () => {
  const authState = useAuthState();
  const { signUp } = useSignUp();
  const { signIn } = useSignIn();
  const { signOut } = useSignOut();

  return {
    ...authState,
    signUp,
    signIn,
    signOut
  };
};
