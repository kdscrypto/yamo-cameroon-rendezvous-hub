-- Créer une politique spécifique pour permettre aux modérateurs d'approuver les annonces
CREATE POLICY "Moderators can approve ads" 
ON public.ads 
FOR UPDATE 
USING (user_has_moderation_rights(auth.uid()))
WITH CHECK (user_has_moderation_rights(auth.uid()));