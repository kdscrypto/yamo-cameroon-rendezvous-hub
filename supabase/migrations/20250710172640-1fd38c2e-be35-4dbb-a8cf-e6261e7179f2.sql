
-- Supprimer l'ancienne politique qui limitait la lecture aux propriétaires
DROP POLICY IF EXISTS "Users can view their own referral codes" ON public.referral_codes;

-- Créer une nouvelle politique permettant la lecture publique des codes actifs
CREATE POLICY "Anyone can view active referral codes for validation" 
  ON public.referral_codes 
  FOR SELECT 
  USING (is_active = true);

-- Créer une politique permettant aux utilisateurs de voir leurs propres codes
CREATE POLICY "Users can view their own referral codes" 
  ON public.referral_codes 
  FOR SELECT 
  USING (auth.uid() = user_id);
