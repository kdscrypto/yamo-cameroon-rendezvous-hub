-- Créer une table pour les données analytics
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_type TEXT NOT NULL,
  metric_value INTEGER DEFAULT 1,
  page_url TEXT,
  user_agent TEXT,
  referrer TEXT,
  ip_address TEXT,
  session_id TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Créer des policies pour les analytics (accessible aux modérateurs et admins)
CREATE POLICY "Moderators can view analytics events" 
ON public.analytics_events 
FOR SELECT 
USING (public.user_has_moderation_rights(auth.uid()));

CREATE POLICY "Anyone can insert analytics events" 
ON public.analytics_events 
FOR INSERT 
WITH CHECK (true);

-- Créer une fonction pour obtenir le résumé analytics
CREATE OR REPLACE FUNCTION public.get_analytics_summary(
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  metric_type TEXT,
  total_count BIGINT,
  unique_sessions BIGINT,
  date_breakdown JSONB
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ae.metric_type,
    COUNT(*) as total_count,
    COUNT(DISTINCT ae.session_id) as unique_sessions,
    COALESCE(
      jsonb_object_agg(
        ae.created_at::DATE,
        daily_counts.count
      ),
      '{}'::jsonb
    ) as date_breakdown
  FROM public.analytics_events ae
  LEFT JOIN (
    SELECT 
      metric_type,
      created_at::DATE as date,
      COUNT(*) as count
    FROM public.analytics_events
    WHERE created_at::DATE BETWEEN p_start_date AND p_end_date
    GROUP BY metric_type, created_at::DATE
  ) daily_counts ON ae.metric_type = daily_counts.metric_type 
    AND ae.created_at::DATE = daily_counts.date
  WHERE ae.created_at::DATE BETWEEN p_start_date AND p_end_date
  GROUP BY ae.metric_type;
END;
$$;

-- Créer une fonction RPC pour track les métriques
CREATE OR REPLACE FUNCTION public.track_metric(
  p_metric_type TEXT,
  p_metric_value INTEGER DEFAULT 1,
  p_page_url TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.analytics_events (
    metric_type,
    metric_value,
    page_url,
    user_agent,
    referrer,
    ip_address,
    session_id,
    metadata
  ) VALUES (
    p_metric_type,
    p_metric_value,
    p_page_url,
    p_user_agent,
    p_referrer,
    p_ip_address,
    p_session_id,
    p_metadata
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$$;