
-- Create site_metrics table to track various website analytics
CREATE TABLE public.site_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL, -- 'page_view', 'user_session', 'ad_interaction', 'form_submission', etc.
  metric_value NUMERIC NOT NULL DEFAULT 1,
  page_url TEXT,
  user_agent TEXT,
  referrer TEXT,
  ip_address TEXT,
  session_id TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  date DATE GENERATED ALWAYS AS (created_at::DATE) STORED
);

-- Create analytics_dashboards table for custom dashboard configurations
CREATE TABLE public.analytics_dashboards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}', -- Dashboard layout and widget configurations
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analytics_alerts table for monitoring thresholds
CREATE TABLE public.analytics_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  metric_type TEXT NOT NULL,
  threshold_value NUMERIC NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('greater_than', 'less_than', 'equals')),
  is_active BOOLEAN DEFAULT true,
  notification_email TEXT,
  last_triggered TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_site_metrics_user_id ON public.site_metrics(user_id);
CREATE INDEX idx_site_metrics_type_date ON public.site_metrics(metric_type, date);
CREATE INDEX idx_site_metrics_created_at ON public.site_metrics(created_at);
CREATE INDEX idx_site_metrics_session_id ON public.site_metrics(session_id);

-- Enable RLS on all tables
ALTER TABLE public.site_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_alerts ENABLE ROW LEVEL SECURITY;

-- RLS policies for site_metrics
CREATE POLICY "Users can view their own metrics" 
  ON public.site_metrics 
  FOR SELECT 
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own metrics" 
  ON public.site_metrics 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all metrics" 
  ON public.site_metrics 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'));

-- RLS policies for analytics_dashboards
CREATE POLICY "Users can manage their own dashboards" 
  ON public.analytics_dashboards 
  FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all dashboards" 
  ON public.analytics_dashboards 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'));

-- RLS policies for analytics_alerts
CREATE POLICY "Users can manage their own alerts" 
  ON public.analytics_alerts 
  FOR ALL 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all alerts" 
  ON public.analytics_alerts 
  FOR SELECT 
  USING (has_role(auth.uid(), 'admin'));

-- Create function to track metrics
CREATE OR REPLACE FUNCTION public.track_metric(
  p_metric_type TEXT,
  p_metric_value NUMERIC DEFAULT 1,
  p_page_url TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL,
  p_ip_address TEXT DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  metric_id UUID;
BEGIN
  INSERT INTO public.site_metrics (
    user_id,
    metric_type,
    metric_value,
    page_url,
    user_agent,
    referrer,
    ip_address,
    session_id,
    metadata
  ) VALUES (
    auth.uid(),
    p_metric_type,
    p_metric_value,
    p_page_url,
    p_user_agent,
    p_referrer,
    p_ip_address,
    p_session_id,
    p_metadata
  ) RETURNING id INTO metric_id;
  
  RETURN metric_id;
END;
$$;

-- Create function to get analytics summary
CREATE OR REPLACE FUNCTION public.get_analytics_summary(
  p_start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
  p_end_date DATE DEFAULT CURRENT_DATE,
  p_metric_types TEXT[] DEFAULT NULL
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
    sm.metric_type,
    COUNT(*) as total_count,
    COUNT(DISTINCT sm.session_id) as unique_sessions,
    jsonb_object_agg(
      sm.date::TEXT, 
      COUNT(*)
    ) as date_breakdown
  FROM public.site_metrics sm
  WHERE sm.date BETWEEN p_start_date AND p_end_date
    AND (p_metric_types IS NULL OR sm.metric_type = ANY(p_metric_types))
    AND (sm.user_id = auth.uid() OR sm.user_id IS NULL OR has_role(auth.uid(), 'admin'))
  GROUP BY sm.metric_type
  ORDER BY total_count DESC;
END;
$$;
