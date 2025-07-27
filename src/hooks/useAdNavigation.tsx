import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { 
  validateAdId, 
  createNavigationError, 
  logNavigationAttempt, 
  logNavigationError 
} from '@/utils/navigationUtils';
import { navigateToAdWithDiagnostics } from '@/utils/adNavigationFix';

export const useAdNavigation = () => {
  const navigate = useNavigate();

  const navigateToAd = useCallback(async (adId: string, adTitle?: string) => {
    try {
      logNavigationAttempt(adId, adTitle);
      
      // Validate adId
      if (!validateAdId(adId)) {
        const error = createNavigationError(
          'INVALID_ID',
          'Invalid ad ID provided',
          adId
        );
        logNavigationError(error);
        return false;
      }

      // Use enhanced navigation with diagnostics
      const success = await navigateToAdWithDiagnostics(adId, navigate, adTitle);
      
      if (success) {
        console.log('✅ Navigation completed successfully');
      } else {
        console.warn('⚠️ Navigation failed or ad not accessible');
      }
      
      return success;
    } catch (error) {
      const navError = createNavigationError(
        'NAVIGATION_FAILED',
        'Failed to navigate to ad',
        adId,
        error instanceof Error ? error : new Error(String(error))
      );
      logNavigationError(navError);
      return false;
    }
  }, [navigate]);

  const navigateToCategory = useCallback((category: string) => {
    try {
      console.log('Navigating to category:', category);
      navigate(`/browse?category=${encodeURIComponent(category)}`);
      return true;
    } catch (error) {
      console.error('Error during category navigation:', error);
      return false;
    }
  }, [navigate]);

  const navigateToLocation = useCallback((location: string) => {
    try {
      console.log('Navigating to location:', location);
      navigate(`/browse?location=${encodeURIComponent(location)}`);
      return true;
    } catch (error) {
      console.error('Error during location navigation:', error);
      return false;
    }
  }, [navigate]);

  return {
    navigateToAd,
    navigateToCategory,
    navigateToLocation
  };
};