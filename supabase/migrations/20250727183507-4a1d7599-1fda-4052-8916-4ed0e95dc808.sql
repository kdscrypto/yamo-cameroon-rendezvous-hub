-- Créer la table pour les événements de sécurité
CREATE TABLE IF NOT EXISTS public.security_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  source TEXT NOT NULL,
  description TEXT,
  ip_address TEXT,
  user_agent TEXT,
  url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON public.security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_ip_address ON public.security_events(ip_address);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON public.security_events(event_type);

-- Activer RLS
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux modérateurs de voir tous les événements
CREATE POLICY "Moderators can view all security events" 
ON public.security_events 
FOR SELECT 
USING (user_has_moderation_rights(auth.uid()));

-- Politique pour permettre l'insertion d'événements de sécurité (système)
CREATE POLICY "System can insert security events" 
ON public.security_events 
FOR INSERT 
WITH CHECK (true);

-- Fonction pour nettoyer les anciens événements (plus de 90 jours)
CREATE OR REPLACE FUNCTION public.cleanup_old_security_events()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.security_events 
  WHERE created_at < now() - interval '90 days';
END;
$$;