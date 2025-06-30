
import { supabase } from '@/integrations/supabase/client';

interface TokenValidationResult {
  isValid: boolean;
  error?: string;
}

export const validatePasswordResetTokens = async (): Promise<TokenValidationResult> => {
  console.log('TokenValidation: Starting password reset validation');
  console.log('TokenValidation: Current URL:', window.location.href);
  console.log('TokenValidation: Search params:', window.location.search);
  console.log('TokenValidation: Hash:', window.location.hash);
  
  try {
    // Check if there's already a valid session
    const { data: { session: existingSession }, error: sessionError } = await supabase.auth.getSession();
    
    if (existingSession && !sessionError) {
      console.log('TokenValidation: Existing valid session found');
      return { isValid: true };
    }

    let accessToken = null;
    let refreshToken = null;
    let type = null;

    // Method 1: Check URL fragments (hash) - Supabase's primary format
    const hashFragment = window.location.hash.substring(1);
    console.log('TokenValidation: Hash fragment:', hashFragment);
    
    if (hashFragment) {
      const hashParams = new URLSearchParams(hashFragment);
      accessToken = hashParams.get('access_token');
      refreshToken = hashParams.get('refresh_token');
      type = hashParams.get('type');
      
      console.log('TokenValidation: Tokens found in hash:', { 
        hasAccessToken: !!accessToken, 
        hasRefreshToken: !!refreshToken, 
        type 
      });
    }

    // Method 2: Check query parameters if no hash tokens
    if (!accessToken || !type) {
      const searchParams = new URLSearchParams(window.location.search);
      const queryAccessToken = searchParams.get('access_token');
      const queryRefreshToken = searchParams.get('refresh_token');
      const queryType = searchParams.get('type');
      
      if (queryAccessToken && queryType) {
        accessToken = queryAccessToken;
        refreshToken = queryRefreshToken;
        type = queryType;
        
        console.log('TokenValidation: Tokens found in query params:', { 
          hasAccessToken: !!accessToken, 
          hasRefreshToken: !!refreshToken, 
          type 
        });
      }
    }

    // Validate tokens presence
    if (!accessToken || !type) {
      console.log('TokenValidation: Missing required tokens');
      return { 
        isValid: false, 
        error: 'Tokens manquants dans l\'URL. Veuillez cliquer à nouveau sur le lien de réinitialisation.' 
      };
    }

    if (type !== 'recovery') {
      console.log('TokenValidation: Incorrect token type:', type);
      return { 
        isValid: false, 
        error: 'Type de token incorrect. Ce lien n\'est pas valide pour la réinitialisation de mot de passe.' 
      };
    }

    console.log('TokenValidation: Attempting to set session with tokens...');
    
    // Set session with tokens
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || ''
    });

    if (error) {
      console.error('TokenValidation: Error setting session:', error);
      
      // Specific error handling
      if (error.message.includes('expired')) {
        return { 
          isValid: false, 
          error: 'Le lien de réinitialisation a expiré. Veuillez demander un nouveau lien.' 
        };
      } else if (error.message.includes('invalid')) {
        return { 
          isValid: false, 
          error: 'Le lien de réinitialisation est invalide. Veuillez demander un nouveau lien.' 
        };
      } else {
        return { 
          isValid: false, 
          error: 'Erreur lors de la validation du lien. Veuillez réessayer.' 
        };
      }
    }

    if (!data.session) {
      console.error('TokenValidation: No session created despite no error');
      return { 
        isValid: false, 
        error: 'Impossible de créer une session avec ce lien. Veuillez demander un nouveau lien.' 
      };
    }

    console.log('TokenValidation: Session created successfully');
    
    // Clean URL to remove sensitive tokens
    const cleanUrl = new URL(window.location.href);
    cleanUrl.hash = '';
    cleanUrl.searchParams.delete('access_token');
    cleanUrl.searchParams.delete('refresh_token');
    cleanUrl.searchParams.delete('type');
    
    const cleanSearch = cleanUrl.searchParams.toString();
    const finalUrl = cleanUrl.pathname + (cleanSearch ? '?' + cleanSearch : '');
    
    window.history.replaceState({}, document.title, finalUrl);
    
    return { isValid: true };
    
  } catch (error: any) {
    console.error('TokenValidation: Unexpected error during validation:', error);
    return { 
      isValid: false, 
      error: 'Une erreur inattendue s\'est produite lors de la validation. Veuillez réessayer.' 
    };
  }
};
