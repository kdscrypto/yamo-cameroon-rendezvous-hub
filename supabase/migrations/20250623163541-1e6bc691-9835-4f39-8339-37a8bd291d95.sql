
-- Ajouter une colonne pour le statut de modération
ALTER TABLE public.ads 
ADD COLUMN moderation_status TEXT DEFAULT 'pending' CHECK (moderation_status IN ('pending', 'approved', 'rejected'));

-- Ajouter des colonnes pour les informations de modération
ALTER TABLE public.ads 
ADD COLUMN moderated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN moderated_by UUID REFERENCES auth.users(id),
ADD COLUMN moderation_notes TEXT;

-- Modifier le statut par défaut pour que les nouvelles annonces soient en attente
ALTER TABLE public.ads 
ALTER COLUMN status SET DEFAULT 'inactive';

-- Créer une table pour les raisons de rejet
CREATE TABLE public.moderation_reasons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insérer les raisons de rejet communes
INSERT INTO public.moderation_reasons (name, description) VALUES
('Contenu inapproprié', 'Le contenu de l''annonce contient des éléments inappropriés'),
('Images non conformes', 'Les images ne respectent pas les conditions d''utilisation'),
('Informations manquantes', 'L''annonce manque d''informations essentielles'),
('Prix non réaliste', 'Le prix indiqué semble non réaliste ou trompeur'),
('Doublon', 'Cette annonce a déjà été publiée'),
('Fausse annonce', 'L''annonce semble être frauduleuse'),
('Localisation incorrecte', 'La localisation indiquée est incorrecte'),
('Autre', 'Autre raison spécifiée dans les notes');

-- Créer une fonction pour auto-approuver les annonces VIP (optionnel)
CREATE OR REPLACE FUNCTION public.auto_approve_vip_ads()
RETURNS TRIGGER AS $$
BEGIN
  -- Si l'annonce est VIP, l'approuver automatiquement
  IF NEW.expires_at IS NOT NULL AND NEW.expires_at > now() THEN
    NEW.moderation_status = 'approved';
    NEW.status = 'active';
    NEW.moderated_at = now();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour l'auto-approbation des annonces VIP
CREATE TRIGGER auto_approve_vip_trigger
  BEFORE INSERT ON public.ads
  FOR EACH ROW
  EXECUTE FUNCTION auto_approve_vip_ads();

-- Mettre à jour les annonces existantes pour qu'elles soient approuvées par défaut
UPDATE public.ads 
SET moderation_status = 'approved', 
    moderated_at = now() 
WHERE moderation_status IS NULL;

-- Activer RLS sur la table moderation_reasons
ALTER TABLE public.moderation_reasons ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre à tous de lire les raisons de modération
CREATE POLICY "Anyone can view moderation reasons" 
ON public.moderation_reasons 
FOR SELECT 
USING (true);
