
-- Créer la table pour stocker les codes de parrainage
CREATE TABLE public.referral_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Créer un index unique sur le code de parrainage
CREATE UNIQUE INDEX referral_codes_code_idx ON public.referral_codes(code) WHERE is_active = true;

-- Créer la table pour les relations de parrainage
CREATE TABLE public.referral_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code_used TEXT NOT NULL,
  level INTEGER NOT NULL CHECK (level IN (1, 2)),
  points_awarded INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(referrer_user_id, referred_user_id, level)
);

-- Créer la table pour les points de parrainage
CREATE TABLE public.referral_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_points INTEGER NOT NULL DEFAULT 0,
  level_1_points INTEGER NOT NULL DEFAULT 0,
  level_2_points INTEGER NOT NULL DEFAULT 0,
  total_referrals_level_1 INTEGER NOT NULL DEFAULT 0,
  total_referrals_level_2 INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Ajouter une colonne referral_code à la table profiles
ALTER TABLE public.profiles ADD COLUMN referral_code TEXT;

-- Créer un index sur le code de parrainage dans profiles
CREATE INDEX profiles_referral_code_idx ON public.profiles(referral_code);

-- Activer RLS sur les nouvelles tables
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_points ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour referral_codes
CREATE POLICY "Users can view their own referral codes" 
  ON public.referral_codes 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own referral codes" 
  ON public.referral_codes 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own referral codes" 
  ON public.referral_codes 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Politiques RLS pour referral_relationships
CREATE POLICY "Users can view their referral relationships" 
  ON public.referral_relationships 
  FOR SELECT 
  USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);

CREATE POLICY "System can create referral relationships" 
  ON public.referral_relationships 
  FOR INSERT 
  WITH CHECK (true);

-- Politiques RLS pour referral_points
CREATE POLICY "Users can view their own referral points" 
  ON public.referral_points 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own referral points" 
  ON public.referral_points 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert referral points" 
  ON public.referral_points 
  FOR INSERT 
  WITH CHECK (true);

-- Fonction pour générer un code de parrainage unique
CREATE OR REPLACE FUNCTION public.generate_referral_code(_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _code TEXT;
  _exists BOOLEAN;
BEGIN
  LOOP
    -- Générer un code de 8 caractères alphanumériques
    _code := upper(substring(md5(random()::text || _user_id::text) from 1 for 8));
    
    -- Vérifier si le code existe déjà
    SELECT EXISTS(SELECT 1 FROM public.referral_codes WHERE code = _code AND is_active = true) INTO _exists;
    
    -- Si le code n'existe pas, on peut l'utiliser
    IF NOT _exists THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN _code;
END;
$$;

-- Fonction pour traiter un nouveau parrainage
CREATE OR REPLACE FUNCTION public.process_referral(_referred_user_id UUID, _referral_code TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _referrer_user_id UUID;
  _level_2_referrer_user_id UUID;
BEGIN
  -- Trouver le parrain direct (niveau 1)
  SELECT user_id INTO _referrer_user_id 
  FROM public.referral_codes 
  WHERE code = _referral_code AND is_active = true;
  
  IF _referrer_user_id IS NULL THEN
    RAISE EXCEPTION 'Code de parrainage invalide';
  END IF;
  
  -- Éviter l'auto-parrainage
  IF _referrer_user_id = _referred_user_id THEN
    RAISE EXCEPTION 'Auto-parrainage non autorisé';
  END IF;
  
  -- Créer la relation de parrainage niveau 1
  INSERT INTO public.referral_relationships (referrer_user_id, referred_user_id, referral_code_used, level, points_awarded)
  VALUES (_referrer_user_id, _referred_user_id, _referral_code, 1, 2);
  
  -- Mettre à jour les points du parrain niveau 1
  INSERT INTO public.referral_points (user_id, total_points, level_1_points, total_referrals_level_1)
  VALUES (_referrer_user_id, 2, 2, 1)
  ON CONFLICT (user_id) 
  DO UPDATE SET 
    total_points = referral_points.total_points + 2,
    level_1_points = referral_points.level_1_points + 2,
    total_referrals_level_1 = referral_points.total_referrals_level_1 + 1,
    updated_at = now();
  
  -- Chercher le parrain de niveau 2
  SELECT referrer_user_id INTO _level_2_referrer_user_id
  FROM public.referral_relationships
  WHERE referred_user_id = _referrer_user_id AND level = 1
  LIMIT 1;
  
  -- Si un parrain de niveau 2 existe, créer la relation et attribuer des points
  IF _level_2_referrer_user_id IS NOT NULL THEN
    INSERT INTO public.referral_relationships (referrer_user_id, referred_user_id, referral_code_used, level, points_awarded)
    VALUES (_level_2_referrer_user_id, _referred_user_id, _referral_code, 2, 1);
    
    -- Mettre à jour les points du parrain niveau 2
    INSERT INTO public.referral_points (user_id, total_points, level_2_points, total_referrals_level_2)
    VALUES (_level_2_referrer_user_id, 1, 1, 1)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
      total_points = referral_points.total_points + 1,
      level_2_points = referral_points.level_2_points + 1,
      total_referrals_level_2 = referral_points.total_referrals_level_2 + 1,
      updated_at = now();
  END IF;
END;
$$;

-- Fonction pour initialiser le système de parrainage d'un utilisateur
CREATE OR REPLACE FUNCTION public.initialize_referral_system(_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _referral_code TEXT;
BEGIN
  -- Générer un code de parrainage unique
  _referral_code := public.generate_referral_code(_user_id);
  
  -- Créer le code de parrainage
  INSERT INTO public.referral_codes (user_id, code)
  VALUES (_user_id, _referral_code);
  
  -- Mettre à jour le profil avec le code de parrainage
  UPDATE public.profiles 
  SET referral_code = _referral_code 
  WHERE id = _user_id;
  
  -- Initialiser les points de parrainage
  INSERT INTO public.referral_points (user_id)
  VALUES (_user_id)
  ON CONFLICT (user_id) DO NOTHING;
END;
$$;

-- Mettre à jour la fonction handle_new_user pour inclure l'initialisation du système de parrainage
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Initialiser le système de parrainage
  PERFORM public.initialize_referral_system(NEW.id);
  
  -- Traiter le code de parrainage si fourni
  IF NEW.raw_user_meta_data->>'referral_code' IS NOT NULL THEN
    PERFORM public.process_referral(NEW.id, NEW.raw_user_meta_data->>'referral_code');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Activer les mises à jour en temps réel pour les tables de parrainage
ALTER TABLE public.referral_points REPLICA IDENTITY FULL;
ALTER TABLE public.referral_relationships REPLICA IDENTITY FULL;

-- Ajouter les tables à la publication realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.referral_points;
ALTER PUBLICATION supabase_realtime ADD TABLE public.referral_relationships;
