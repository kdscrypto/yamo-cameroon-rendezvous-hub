-- Ajouter une table pour tracker les emails envoyés et leurs statuts
CREATE TABLE IF NOT EXISTS public.email_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_address TEXT NOT NULL,
  email_type TEXT NOT NULL, -- 'auth', 'contact', 'notification', etc.
  status TEXT NOT NULL DEFAULT 'sent', -- 'sent', 'delivered', 'bounced', 'failed'
  provider TEXT NOT NULL DEFAULT 'supabase', -- 'supabase', 'resend'
  bounce_reason TEXT,
  risk_level TEXT CHECK (risk_level IN ('low', 'medium', 'high')),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.email_tracking ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux admins de voir tous les emails
CREATE POLICY "Admins can view all email tracking" 
ON public.email_tracking 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Politique pour permettre aux systèmes d'insérer des logs
CREATE POLICY "System can insert email tracking" 
ON public.email_tracking 
FOR INSERT 
WITH CHECK (true);

-- Index pour améliorer les performances
CREATE INDEX idx_email_tracking_email ON public.email_tracking(email_address);
CREATE INDEX idx_email_tracking_status ON public.email_tracking(status);
CREATE INDEX idx_email_tracking_type ON public.email_tracking(email_type);
CREATE INDEX idx_email_tracking_created_at ON public.email_tracking(created_at DESC);

-- Fonction pour analyser les bounces
CREATE OR REPLACE FUNCTION public.analyze_email_bounces(days_back INTEGER DEFAULT 30)
RETURNS TABLE(
  email_address TEXT,
  bounce_count BIGINT,
  total_emails BIGINT,
  bounce_rate NUMERIC,
  last_bounce_date TIMESTAMP WITH TIME ZONE,
  risk_assessment TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    et.email_address,
    COUNT(*) FILTER (WHERE et.status = 'bounced') as bounce_count,
    COUNT(*) as total_emails,
    ROUND(
      (COUNT(*) FILTER (WHERE et.status = 'bounced')::NUMERIC / 
       NULLIF(COUNT(*), 0) * 100), 2
    ) as bounce_rate,
    MAX(et.created_at) FILTER (WHERE et.status = 'bounced') as last_bounce_date,
    CASE 
      WHEN COUNT(*) FILTER (WHERE et.status = 'bounced') >= 3 THEN 'HIGH_RISK'
      WHEN COUNT(*) FILTER (WHERE et.status = 'bounced') >= 1 THEN 'MEDIUM_RISK'
      ELSE 'LOW_RISK'
    END as risk_assessment
  FROM public.email_tracking et
  WHERE et.created_at >= now() - (days_back || ' days')::INTERVAL
  GROUP BY et.email_address
  HAVING COUNT(*) FILTER (WHERE et.status = 'bounced') > 0
  ORDER BY bounce_count DESC, bounce_rate DESC;
END;
$$;

-- Fonction pour nettoyer les anciens logs d'emails
CREATE OR REPLACE FUNCTION public.cleanup_old_email_tracking()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Supprimer les logs de plus de 6 mois
  DELETE FROM public.email_tracking 
  WHERE created_at < now() - interval '6 months';
  
  -- Garder seulement les bounces récents pour l'analyse
  DELETE FROM public.email_tracking 
  WHERE status != 'bounced' 
    AND created_at < now() - interval '3 months';
END;
$$;