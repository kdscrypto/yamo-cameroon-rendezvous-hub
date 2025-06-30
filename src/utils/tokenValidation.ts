
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
      console.log('TokenValidation: Existing session found');
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

    // Method 2: Check query parameters if no hash
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

    // Validate tokens
    if (!accessToken) {
      console.log('TokenValidation: No access_token found');
      throw new Error('Aucun token d\'accès trouvé dans l\'URL');
    }

    if (type !== 'recovery') {
      console.log('TokenValidation: Incorrect type:', type);
      throw new Error(`Type de token incorrect: ${type}. Attendu: recovery`);
    }

    console.log('TokenValidation: Attempting to set session with tokens...');
    
    // Set session with tokens
    const { data, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken || ''
    });

    if (error) {
      console.error('TokenValidation: Error setting session:', error);
      throw new Error(`Erreur de session: ${error.message}`);
    }

    if (!data.session) {
      console.error('TokenValidation: No session created');
      throw new Error('Impossible de créer une session avec les tokens fournis');
    }

    console.log('TokenValidation: Session set successfully:', data);
    
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
    console.error('TokenValidation: Error during validation:', error);
    
    let errorMessage = "Le lien de réinitialisation est invalide ou a expiré.";
    
    if (error.message.includes('expired')) {
      errorMessage = "Le lien de réinitialisation a expiré. Veuillez demander un nouveau lien.";
    } else if (error.message.includes('invalid')) {
      errorMessage = "Le lien de réinitialisation est invalide. Veuillez demander un nouveau lien.";
    } else if (error.message.includes('Token')) {
      errorMessage = "Les informations de sécurité sont manquantes ou incorrectes.";
    }
    
    return { isValid: false, error: errorMessage };
  }
};
