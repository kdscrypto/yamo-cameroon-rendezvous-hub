
-- Supprimer le trigger qui auto-approuve les annonces VIP
DROP TRIGGER IF EXISTS auto_approve_vip_trigger ON public.ads;

-- Supprimer aussi la fonction associée
DROP FUNCTION IF EXISTS public.auto_approve_vip_ads();
