
-- Créer une fonction pour vérifier si un utilisateur a des droits de modération
CREATE OR REPLACE FUNCTION public.user_has_moderation_rights(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'moderator')
  )
$$;
