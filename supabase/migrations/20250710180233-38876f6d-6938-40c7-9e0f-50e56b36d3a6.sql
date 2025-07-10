-- Activer le realtime sur les tables de parrainage pour les mises à jour en temps réel

-- Configurer les tables pour le realtime
ALTER TABLE public.referral_points REPLICA IDENTITY FULL;
ALTER TABLE public.referral_relationships REPLICA IDENTITY FULL;
ALTER TABLE public.referral_codes REPLICA IDENTITY FULL;

-- Ajouter les tables à la publication realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.referral_points;
ALTER PUBLICATION supabase_realtime ADD TABLE public.referral_relationships;
ALTER PUBLICATION supabase_realtime ADD TABLE public.referral_codes;