import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAnalytics } from '@/hooks/useAnalytics';

export const PageTracker = () => {
  const location = useLocation();
  const { trackPageView, trackUserSession } = useAnalytics();

  useEffect(() => {
    // Track page view on route change
    trackPageView();
  }, [location.pathname]); // Enlever trackPageView des dépendances

  useEffect(() => {
    // Track user session on app load
    trackUserSession();
  }, []); // Enlever trackUserSession des dépendances

  return null;
};