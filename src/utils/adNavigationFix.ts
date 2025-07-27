// Centralized fixes for ad navigation issues

import { supabase } from '@/integrations/supabase/client';

export interface AdNavigationDiagnostics {
  timestamp: string;
  adId: string;
  adExists: boolean;
  userAgent: string;
  currentUrl: string;
  error?: string;
}

export const diagnosticsStorage = {
  key: 'yamo-ad-navigation-diagnostics',
  
  log: (diagnostic: AdNavigationDiagnostics) => {
    try {
      const existing = localStorage.getItem(diagnosticsStorage.key);
      const diagnostics = existing ? JSON.parse(existing) : [];
      diagnostics.push(diagnostic);
      
      // Keep only last 50 entries
      if (diagnostics.length > 50) {
        diagnostics.splice(0, diagnostics.length - 50);
      }
      
      localStorage.setItem(diagnosticsStorage.key, JSON.stringify(diagnostics));
    } catch (error) {
      console.warn('Failed to log navigation diagnostic:', error);
    }
  },
  
  get: (): AdNavigationDiagnostics[] => {
    try {
      const stored = localStorage.getItem(diagnosticsStorage.key);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to retrieve navigation diagnostics:', error);
      return [];
    }
  },
  
  clear: () => {
    try {
      localStorage.removeItem(diagnosticsStorage.key);
    } catch (error) {
      console.warn('Failed to clear navigation diagnostics:', error);
    }
  }
};

export const checkAdExists = async (adId: string): Promise<boolean> => {
  try {
    console.log(`🔍 Checking if ad exists: ${adId}`);
    
    const { data, error } = await supabase
      .from('ads')
      .select('id, title, moderation_status, status')
      .eq('id', adId)
      .maybeSingle();

    if (error) {
      console.error('Error checking ad existence:', error);
      return false;
    }

    const exists = !!data && data.moderation_status === 'approved' && data.status === 'active';
    
    console.log(`Ad ${adId} exists and is accessible:`, exists);
    if (data) {
      console.log('Ad details:', { 
        title: data.title, 
        moderation_status: data.moderation_status, 
        status: data.status 
      });
    }
    
    return exists;
  } catch (error) {
    console.error('Exception checking ad existence:', error);
    return false;
  }
};

export const performNavigationDiagnostic = async (adId: string): Promise<AdNavigationDiagnostics> => {
  const diagnostic: AdNavigationDiagnostics = {
    timestamp: new Date().toISOString(),
    adId,
    adExists: false,
    userAgent: navigator.userAgent,
    currentUrl: window.location.href
  };

  try {
    diagnostic.adExists = await checkAdExists(adId);
  } catch (error) {
    diagnostic.error = error instanceof Error ? error.message : String(error);
  }

  diagnosticsStorage.log(diagnostic);
  return diagnostic;
};

// Enhanced navigation function with diagnostics
export const navigateToAdWithDiagnostics = async (
  adId: string, 
  navigate: (path: string) => void,
  adTitle?: string
) => {
  console.group(`🚀 Enhanced Ad Navigation: ${adTitle || adId}`);
  
  try {
    // Perform diagnostic check
    const diagnostic = await performNavigationDiagnostic(adId);
    
    console.log('Diagnostic result:', diagnostic);
    
    if (!diagnostic.adExists) {
      console.warn('❌ Ad does not exist or is not accessible');
      // Could show a toast or redirect to search
      return false;
    }

    // Proceed with navigation
    console.log('✅ Ad exists, proceeding with navigation');
    navigate(`/ad/${adId}`);
    return true;
    
  } catch (error) {
    console.error('Navigation failed with error:', error);
    return false;
  } finally {
    console.groupEnd();
  }
};
