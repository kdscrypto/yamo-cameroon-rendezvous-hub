
-- Créer un enum pour les rôles d'application
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Créer la table user_roles pour gérer les permissions
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Activer RLS sur la table user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Créer une fonction de sécurité pour vérifier les rôles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Politique pour permettre aux utilisateurs de voir leurs propres rôles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Politique pour permettre aux admins de gérer tous les rôles
CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Accorder les droits de modération à l'utilisateur spécifié
INSERT INTO public.user_roles (user_id, role) 
VALUES ('b199e717-3eb2-4beb-9d84-05a8ad172e77', 'moderator')
ON CONFLICT (user_id, role) DO NOTHING;

-- Activer les mises à jour en temps réel pour la table ads
ALTER TABLE public.ads REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ads;
