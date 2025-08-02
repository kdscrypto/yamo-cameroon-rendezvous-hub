-- Corriger les fonctions avec search_path pour la sécurité
CREATE OR REPLACE FUNCTION public.update_rating_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';