-- Ajouter la clé étrangère manquante entre referral_codes et profiles
ALTER TABLE public.referral_codes 
ADD CONSTRAINT fk_referral_codes_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Créer un index pour améliorer les performances des requêtes de validation
CREATE INDEX IF NOT EXISTS idx_referral_codes_code_active 
ON public.referral_codes(code, is_active) 
WHERE is_active = true;