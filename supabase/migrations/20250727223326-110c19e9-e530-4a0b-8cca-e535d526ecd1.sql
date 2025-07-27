-- Fix database function security by adding proper search_path to all functions
-- This prevents potential security vulnerabilities from search path injection

-- 1. Update cleanup_old_security_events function
CREATE OR REPLACE FUNCTION public.cleanup_old_security_events()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.security_events 
  WHERE created_at < now() - interval '90 days';
END;
$function$;

-- 2. Update update_conversation_timestamp function
CREATE OR REPLACE FUNCTION public.update_conversation_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  UPDATE public.conversations 
  SET last_message_at = NEW.created_at,
      updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$function$;

-- 3. Update cleanup_old_notifications function
CREATE OR REPLACE FUNCTION public.cleanup_old_notifications()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.notifications 
  WHERE created_at < now() - interval '30 days';
END;
$function$;

-- 4. Update update_user_presence_timestamp function
CREATE OR REPLACE FUNCTION public.update_user_presence_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- 5. Update has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$function$;

-- 6. Update user_has_moderation_rights function
CREATE OR REPLACE FUNCTION public.user_has_moderation_rights(_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'moderator')
  )
$function$;

-- 7. Update generate_referral_code function
CREATE OR REPLACE FUNCTION public.generate_referral_code(_user_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- 8. Update process_referral function
CREATE OR REPLACE FUNCTION public.process_referral(_referred_user_id uuid, _referral_code text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- 9. Update initialize_referral_system function
CREATE OR REPLACE FUNCTION public.initialize_referral_system(_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- 10. Update track_metric function
CREATE OR REPLACE FUNCTION public.track_metric(p_metric_type text, p_metric_value integer DEFAULT 1, p_page_url text DEFAULT NULL::text, p_user_agent text DEFAULT NULL::text, p_referrer text DEFAULT NULL::text, p_ip_address text DEFAULT NULL::text, p_session_id text DEFAULT NULL::text, p_metadata jsonb DEFAULT NULL::jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  event_id UUID;
BEGIN
  INSERT INTO public.analytics_events (
    metric_type,
    metric_value,
    page_url,
    user_agent,
    referrer,
    ip_address,
    session_id,
    metadata
  ) VALUES (
    p_metric_type,
    p_metric_value,
    p_page_url,
    p_user_agent,
    p_referrer,
    p_ip_address,
    p_session_id,
    p_metadata
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$function$;

-- 11. Update get_analytics_summary function
CREATE OR REPLACE FUNCTION public.get_analytics_summary(p_start_date date DEFAULT (CURRENT_DATE - '30 days'::interval), p_end_date date DEFAULT CURRENT_DATE)
 RETURNS TABLE(metric_type text, total_count bigint, unique_sessions bigint, date_breakdown jsonb)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    ae.metric_type,
    COUNT(*) as total_count,
    COUNT(DISTINCT ae.session_id) as unique_sessions,
    COALESCE(
      jsonb_object_agg(
        ae.created_at::DATE,
        daily_counts.count
      ) FILTER (WHERE daily_counts.count IS NOT NULL),
      '{}'::jsonb
    ) as date_breakdown
  FROM public.analytics_events ae
  LEFT JOIN (
    SELECT 
      ae_inner.metric_type,
      ae_inner.created_at::DATE as date,
      COUNT(*) as count
    FROM public.analytics_events ae_inner
    WHERE ae_inner.created_at::DATE BETWEEN p_start_date AND p_end_date
    GROUP BY ae_inner.metric_type, ae_inner.created_at::DATE
  ) daily_counts ON ae.metric_type = daily_counts.metric_type 
    AND ae.created_at::DATE = daily_counts.date
  WHERE ae.created_at::DATE BETWEEN p_start_date AND p_end_date
  GROUP BY ae.metric_type;
END;
$function$;

-- 12. Update handle_new_user_stats function
CREATE OR REPLACE FUNCTION public.handle_new_user_stats()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$function$;

-- 13. Update update_user_ad_stats function
CREATE OR REPLACE FUNCTION public.update_user_ad_stats()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.user_stats 
    SET total_ads = total_ads + 1,
        active_ads = CASE WHEN NEW.status = 'active' THEN active_ads + 1 ELSE active_ads END,
        updated_at = now()
    WHERE user_id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE public.user_stats 
    SET active_ads = (
      SELECT COUNT(*) FROM public.ads 
      WHERE user_id = NEW.user_id AND status = 'active'
    ),
    updated_at = now()
    WHERE user_id = NEW.user_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.user_stats 
    SET total_ads = total_ads - 1,
        active_ads = CASE WHEN OLD.status = 'active' THEN active_ads - 1 ELSE active_ads END,
        updated_at = now()
    WHERE user_id = OLD.user_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

-- 14. Update update_user_message_stats function
CREATE OR REPLACE FUNCTION public.update_user_message_stats()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Update sender stats
    UPDATE public.user_stats 
    SET total_messages = total_messages + 1,
        updated_at = now()
    WHERE user_id = NEW.sender_id;
    
    -- Update recipient stats
    UPDATE public.user_stats 
    SET unread_messages = unread_messages + 1,
        updated_at = now()
    WHERE user_id = NEW.recipient_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- If message is marked as read, decrease unread count
    IF OLD.is_read = false AND NEW.is_read = true THEN
      UPDATE public.user_stats 
      SET unread_messages = unread_messages - 1,
          updated_at = now()
      WHERE user_id = NEW.recipient_id;
    END IF;
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$function$;

-- 15. Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;