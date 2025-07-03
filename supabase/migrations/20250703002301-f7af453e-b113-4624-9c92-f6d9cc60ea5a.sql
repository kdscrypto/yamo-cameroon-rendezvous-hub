
-- Ajouter les champs phone et whatsapp à la table ads
ALTER TABLE public.ads 
ADD COLUMN phone TEXT,
ADD COLUMN whatsapp TEXT;

-- Ajouter des commentaires pour clarifier l'utilisation des colonnes
COMMENT ON COLUMN public.ads.phone IS 'Numéro de téléphone principal pour contacter l''annonceur';
COMMENT ON COLUMN public.ads.whatsapp IS 'Numéro WhatsApp (optionnel, peut être différent du téléphone principal)';
