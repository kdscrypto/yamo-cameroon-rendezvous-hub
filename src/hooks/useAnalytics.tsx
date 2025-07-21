import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface MetricData {
  metric_type: string;
  metric_value?: number;
  page_url?: string;
  user_agent?: string;
  referrer?: string;
  ip_address?: string;
  session_id?: string;
  metadata?: Record<string, any>;
}

export const useAnalytics = () => {
  const { user } = useAuth();

  const trackMetric = useCallback(async (data: MetricData) => {
    try {
      const { data: result, error } = await supabase.rpc('track_metric', {
        p_metric_type: data.metric_type,
        p_metric_value: data.metric_value || 1,
        p_page_url: data.page_url || window.location.href,
        p_user_agent: data.user_agent || navigator.userAgent,
        p_referrer: data.referrer || document.referrer,
        p_ip_address: data.ip_address,
        p_session_id: data.session_id || getSessionId(),
        p_metadata: data.metadata || {}
      });

      if (error) {
        console.error('Error tracking metric:', error);
        return null;
      }

      return result;
    } catch (error) {
      console.error('Error tracking metric:', error);
      return null;
    }
  }, []);

  const trackPageView = useCallback((page_url?: string) => {
    trackMetric({
      metric_type: 'page_view',
      page_url: page_url || window.location.href,
      metadata: {
        title: document.title,
        timestamp: new Date().toISOString()
      }
    });
  }, [trackMetric]);

  const trackAdInteraction = useCallback((adId: string, action: string) => {
    trackMetric({
      metric_type: 'ad_interaction',
      metadata: {
        ad_id: adId,
        action: action,
        timestamp: new Date().toISOString()
      }
    });
  }, [trackMetric]);

  const trackFormSubmission = useCallback((formType: string, success: boolean) => {
    trackMetric({
      metric_type: 'form_submission',
      metadata: {
        form_type: formType,
        success: success,
        timestamp: new Date().toISOString()
      }
    });
  }, [trackMetric]);

  const trackUserSession = useCallback(() => {
    trackMetric({
      metric_type: 'user_session',
      metadata: {
        user_id: user?.id,
        authenticated: !!user,
        timestamp: new Date().toISOString()
      }
    });
  }, [trackMetric, user]);

  return {
    trackMetric,
    trackPageView,
    trackAdInteraction,
    trackFormSubmission,
    trackUserSession
  };
};

// Helper function to get or create session ID
function getSessionId(): string {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
}