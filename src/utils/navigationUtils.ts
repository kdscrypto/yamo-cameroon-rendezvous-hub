// Navigation utilities for debugging and error handling

export interface NavigationError {
  type: 'INVALID_ID' | 'NAVIGATION_FAILED' | 'UNKNOWN_ERROR';
  message: string;
  adId?: string;
  originalError?: Error;
}

export const validateAdId = (adId: unknown): adId is string => {
  return typeof adId === 'string' && adId.trim().length > 0;
};

export const createNavigationError = (
  type: NavigationError['type'],
  message: string,
  adId?: string,
  originalError?: Error
): NavigationError => {
  return {
    type,
    message,
    adId,
    originalError
  };
};

export const logNavigationAttempt = (adId: string, title?: string) => {
  console.group('🧭 Navigation Attempt');
  console.log('Ad ID:', adId);
  console.log('Ad Title:', title || 'N/A');
  console.log('Timestamp:', new Date().toISOString());
  console.log('Current URL:', window.location.href);
  console.groupEnd();
};

export const logNavigationError = (error: NavigationError) => {
  console.group('❌ Navigation Error');
  console.error('Type:', error.type);
  console.error('Message:', error.message);
  if (error.adId) console.error('Ad ID:', error.adId);
  if (error.originalError) console.error('Original Error:', error.originalError);
  console.groupEnd();
};

export const testAdExists = async (adId: string): Promise<boolean> => {
  try {
    // This would typically check with your API/database
    // For now, just simulate a check
    console.log(`Checking if ad exists: ${adId}`);
    return true; // Simulated response
  } catch (error) {
    console.error('Error checking ad existence:', error);
    return false;
  }
};