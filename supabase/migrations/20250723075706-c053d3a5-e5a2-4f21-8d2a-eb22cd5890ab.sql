-- Fix the get_analytics_summary function
CREATE OR REPLACE FUNCTION public.get_analytics_summary(p_start_date date DEFAULT (CURRENT_DATE - '30 days'::interval), p_end_date date DEFAULT CURRENT_DATE)
 RETURNS TABLE(metric_type text, total_count bigint, unique_sessions bigint, date_breakdown jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
      ) FILTER (WHERE daily_counts.count IS NOT NULL),
      '{}'::jsonb
    ) as date_breakdown
  FROM public.analytics_events ae
  LEFT JOIN (
    SELECT 
      ae_inner.metric_type,
      ae_inner.created_at::DATE as date,
      COUNT(*) as count
    FROM public.analytics_events ae_inner
    WHERE ae_inner.created_at::DATE BETWEEN p_start_date AND p_end_date
    GROUP BY ae_inner.metric_type, ae_inner.created_at::DATE
  ) daily_counts ON ae.metric_type = daily_counts.metric_type 
    AND ae.created_at::DATE = daily_counts.date
  WHERE ae.created_at::DATE BETWEEN p_start_date AND p_end_date
  GROUP BY ae.metric_type;
END;
$function$