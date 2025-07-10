-- Configurer les tables pour le realtime (REPLICA IDENTITY FULL)
-- Ceci permet d'avoir toutes les données de la ligne lors des changements

ALTER TABLE public.referral_points REPLICA IDENTITY FULL;
ALTER TABLE public.referral_relationships REPLICA IDENTITY FULL;
ALTER TABLE public.referral_codes REPLICA IDENTITY FULL;