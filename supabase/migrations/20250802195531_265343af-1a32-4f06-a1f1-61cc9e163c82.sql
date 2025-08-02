-- Ajouter les champs de notation à la table ads
ALTER TABLE public.ads 
ADD COLUMN average_rating DECIMAL(3,2) DEFAULT 0.00,
ADD COLUMN rating_count INTEGER DEFAULT 0;

-- Créer la table ratings
CREATE TABLE public.ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  ad_id UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  rating_value INTEGER NOT NULL CHECK (rating_value >= 1 AND rating_value <= 5),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, ad_id)
);

-- Activer RLS sur la table ratings
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir toutes les notations
CREATE POLICY "Anyone can view ratings" 
ON public.ratings 
FOR SELECT 
USING (true);

-- Politique pour permettre aux utilisateurs connectés d'insérer leurs propres notations
CREATE POLICY "Users can insert their own ratings" 
ON public.ratings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Politique pour permettre aux utilisateurs de mettre à jour leurs propres notations
CREATE POLICY "Users can update their own ratings" 
ON public.ratings 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Fonction pour mettre à jour automatiquement updated_at
CREATE OR REPLACE FUNCTION public.update_rating_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
CREATE TRIGGER update_ratings_updated_at
  BEFORE UPDATE ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_rating_updated_at_column();

-- Fonction pour recalculer automatiquement la note moyenne et le nombre de votes
CREATE OR REPLACE FUNCTION public.update_ad_rating_stats()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL(3,2);
  total_ratings INTEGER;
  target_ad_id UUID;
BEGIN
  -- Déterminer l'ad_id selon l'opération
  IF TG_OP = 'DELETE' THEN
    target_ad_id := OLD.ad_id;
  ELSE
    target_ad_id := NEW.ad_id;
  END IF;

  -- Calculer la nouvelle moyenne et le nombre total
  SELECT 
    COALESCE(ROUND(AVG(rating_value)::NUMERIC, 2), 0),
    COUNT(*)
  INTO avg_rating, total_ratings
  FROM public.ratings 
  WHERE ad_id = target_ad_id;

  -- Mettre à jour la table ads
  UPDATE public.ads 
  SET 
    average_rating = avg_rating,
    rating_count = total_ratings,
    updated_at = now()
  WHERE id = target_ad_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers pour mettre à jour les stats automatiquement
CREATE TRIGGER update_ad_rating_stats_insert
  AFTER INSERT ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ad_rating_stats();

CREATE TRIGGER update_ad_rating_stats_update
  AFTER UPDATE ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ad_rating_stats();

CREATE TRIGGER update_ad_rating_stats_delete
  AFTER DELETE ON public.ratings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ad_rating_stats();