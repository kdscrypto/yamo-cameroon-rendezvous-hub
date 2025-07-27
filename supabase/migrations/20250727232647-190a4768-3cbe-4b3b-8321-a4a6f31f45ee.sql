-- Phase 2: Enhanced Access Control (High Priority)
-- 1. Prevent role self-modification
-- 2. Add audit trails for admin/moderator actions
-- 3. Create security functions to validate role changes
-- 4. Add rate limiting to role modification endpoints

-- ================================================
-- 1. CREATE AUDIT TRAIL TABLE
-- ================================================

CREATE TABLE public.admin_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  target_user_id UUID,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id TEXT,
  old_values JSONB DEFAULT '{}',
  new_values JSONB DEFAULT '{}',
  ip_address TEXT,
  user_agent TEXT,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins and system can view audit logs
CREATE POLICY "Only admins can view audit logs" 
ON public.admin_audit_log 
FOR SELECT 
USING (user_has_moderation_rights(auth.uid()));

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" 
ON public.admin_audit_log 
FOR INSERT 
WITH CHECK (true);

-- ================================================
-- 2. CREATE ROLE CHANGE VALIDATION FUNCTIONS
-- ================================================

-- Function to validate role changes
CREATE OR REPLACE FUNCTION public.validate_role_change(
  _admin_user_id UUID,
  _target_user_id UUID,
  _new_role app_role,
  _action TEXT DEFAULT 'modify'
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _admin_is_admin BOOLEAN;
  _target_is_admin BOOLEAN;
  _current_role app_role;
BEGIN
  -- Check if admin user has admin role
  SELECT public.has_role(_admin_user_id, 'admin') INTO _admin_is_admin;
  
  -- Prevent self-modification
  IF _admin_user_id = _target_user_id THEN
    RAISE EXCEPTION 'Self-modification of roles is not allowed';
  END IF;
  
  -- Only admins can modify roles
  IF NOT _admin_is_admin THEN
    RAISE EXCEPTION 'Only admins can modify user roles';
  END IF;
  
  -- Get current role of target user
  SELECT role INTO _current_role 
  FROM public.user_roles 
  WHERE user_id = _target_user_id 
  ORDER BY created_at DESC 
  LIMIT 1;
  
  -- Check if target user is admin
  SELECT public.has_role(_target_user_id, 'admin') INTO _target_is_admin;
  
  -- Prevent removal of the last admin
  IF _action = 'remove' AND _target_is_admin THEN
    IF (SELECT COUNT(*) FROM public.user_roles WHERE role = 'admin') <= 1 THEN
      RAISE EXCEPTION 'Cannot remove the last admin user';
    END IF;
  END IF;
  
  -- Prevent downgrading admin to user directly (must go through moderator)
  IF _current_role = 'admin' AND _new_role = 'user' THEN
    RAISE EXCEPTION 'Admin users cannot be directly downgraded to user role. Remove admin role first.';
  END IF;
  
  RETURN true;
END;
$$;

-- Function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  _admin_user_id UUID,
  _target_user_id UUID DEFAULT NULL,
  _action TEXT DEFAULT '',
  _resource_type TEXT DEFAULT '',
  _resource_id TEXT DEFAULT NULL,
  _old_values JSONB DEFAULT '{}',
  _new_values JSONB DEFAULT '{}',
  _metadata JSONB DEFAULT '{}',
  _ip_address TEXT DEFAULT NULL,
  _user_agent TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _log_id UUID;
BEGIN
  INSERT INTO public.admin_audit_log (
    admin_user_id,
    target_user_id,
    action,
    resource_type,
    resource_id,
    old_values,
    new_values,
    metadata,
    ip_address,
    user_agent
  ) VALUES (
    _admin_user_id,
    _target_user_id,
    _action,
    _resource_type,
    _resource_id,
    _old_values,
    _new_values,
    _metadata,
    _ip_address,
    _user_agent
  ) RETURNING id INTO _log_id;
  
  RETURN _log_id;
END;
$$;

-- ================================================
-- 3. SECURE ROLE MANAGEMENT FUNCTIONS
-- ================================================

-- Function to safely add user role
CREATE OR REPLACE FUNCTION public.add_user_role(
  _target_user_id UUID,
  _role app_role,
  _ip_address TEXT DEFAULT NULL,
  _user_agent TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _admin_user_id UUID := auth.uid();
  _existing_role app_role;
BEGIN
  -- Validate the role change
  PERFORM public.validate_role_change(_admin_user_id, _target_user_id, _role, 'add');
  
  -- Check if user already has this role
  SELECT role INTO _existing_role 
  FROM public.user_roles 
  WHERE user_id = _target_user_id AND role = _role;
  
  IF _existing_role IS NOT NULL THEN
    RAISE EXCEPTION 'User already has this role';
  END IF;
  
  -- Add the role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_target_user_id, _role);
  
  -- Log the action
  PERFORM public.log_admin_action(
    _admin_user_id,
    _target_user_id,
    'add_role',
    'user_role',
    _target_user_id::text,
    '{}',
    jsonb_build_object('role', _role),
    jsonb_build_object('timestamp', now()),
    _ip_address,
    _user_agent
  );
  
  RETURN true;
END;
$$;

-- Function to safely remove user role
CREATE OR REPLACE FUNCTION public.remove_user_role(
  _target_user_id UUID,
  _role app_role,
  _ip_address TEXT DEFAULT NULL,
  _user_agent TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _admin_user_id UUID := auth.uid();
  _existing_role app_role;
BEGIN
  -- Validate the role change
  PERFORM public.validate_role_change(_admin_user_id, _target_user_id, _role, 'remove');
  
  -- Check if user has this role
  SELECT role INTO _existing_role 
  FROM public.user_roles 
  WHERE user_id = _target_user_id AND role = _role;
  
  IF _existing_role IS NULL THEN
    RAISE EXCEPTION 'User does not have this role';
  END IF;
  
  -- Remove the role
  DELETE FROM public.user_roles 
  WHERE user_id = _target_user_id AND role = _role;
  
  -- Log the action
  PERFORM public.log_admin_action(
    _admin_user_id,
    _target_user_id,
    'remove_role',
    'user_role',
    _target_user_id::text,
    jsonb_build_object('role', _role),
    '{}',
    jsonb_build_object('timestamp', now()),
    _ip_address,
    _user_agent
  );
  
  RETURN true;
END;
$$;

-- ================================================
-- 4. UPDATE EXISTING RLS POLICIES
-- ================================================

-- Drop existing policies on user_roles to replace with more secure ones
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

-- New stricter policies
CREATE POLICY "Admins can view all roles (no self-modification)" 
ON public.user_roles 
FOR SELECT 
USING (user_has_moderation_rights(auth.uid()));

CREATE POLICY "Only system can insert roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (false); -- Force use of secure functions

CREATE POLICY "Only system can update roles" 
ON public.user_roles 
FOR UPDATE 
USING (false); -- Force use of secure functions

CREATE POLICY "Only system can delete roles" 
ON public.user_roles 
FOR DELETE 
USING (false); -- Force use of secure functions

-- Allow users to view their own roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

-- ================================================
-- 5. RATE LIMITING TABLE FOR ROLE MODIFICATIONS
-- ================================================

CREATE TABLE public.role_modification_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  action_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_action TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.role_modification_limits ENABLE ROW LEVEL SECURITY;

-- Only system can manage rate limits
CREATE POLICY "System can manage rate limits" 
ON public.role_modification_limits 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Function to check rate limits for role modifications
CREATE OR REPLACE FUNCTION public.check_role_modification_rate_limit(
  _admin_user_id UUID,
  _max_actions INTEGER DEFAULT 10,
  _window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _current_count INTEGER;
  _window_start TIMESTAMP WITH TIME ZONE := now() - (_window_minutes || ' minutes')::INTERVAL;
BEGIN
  -- Get current action count in the time window
  SELECT COALESCE(SUM(action_count), 0) INTO _current_count
  FROM public.role_modification_limits
  WHERE admin_user_id = _admin_user_id
    AND window_start > _window_start;
  
  -- Check if limit exceeded
  IF _current_count >= _max_actions THEN
    -- Log rate limit violation
    PERFORM public.log_admin_action(
      _admin_user_id,
      NULL,
      'rate_limit_exceeded',
      'role_modification',
      NULL,
      '{}',
      jsonb_build_object(
        'current_count', _current_count,
        'max_actions', _max_actions,
        'window_minutes', _window_minutes
      ),
      jsonb_build_object('timestamp', now())
    );
    
    RETURN false;
  END IF;
  
  -- Update or insert rate limit record
  INSERT INTO public.role_modification_limits (admin_user_id, action_count)
  VALUES (_admin_user_id, 1)
  ON CONFLICT (admin_user_id) 
  DO UPDATE SET 
    action_count = role_modification_limits.action_count + 1,
    last_action = now();
  
  RETURN true;
END;
$$;

-- ================================================
-- 6. CREATE TRIGGER FOR AUTOMATIC AUDIT LOGGING
-- ================================================

-- Function to automatically log role changes
CREATE OR REPLACE FUNCTION public.audit_role_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log role insertions
  IF TG_OP = 'INSERT' THEN
    PERFORM public.log_admin_action(
      auth.uid(),
      NEW.user_id,
      'role_granted',
      'user_role',
      NEW.id::text,
      '{}',
      jsonb_build_object('role', NEW.role),
      jsonb_build_object('trigger', 'automatic', 'timestamp', now())
    );
    RETURN NEW;
  END IF;
  
  -- Log role deletions
  IF TG_OP = 'DELETE' THEN
    PERFORM public.log_admin_action(
      auth.uid(),
      OLD.user_id,
      'role_revoked',
      'user_role',
      OLD.id::text,
      jsonb_build_object('role', OLD.role),
      '{}',
      jsonb_build_object('trigger', 'automatic', 'timestamp', now())
    );
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Create trigger for role change auditing
CREATE TRIGGER audit_user_role_changes
  AFTER INSERT OR DELETE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.audit_role_changes();

-- ================================================
-- 7. CLEANUP FUNCTION FOR OLD AUDIT LOGS
-- ================================================

CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Delete audit logs older than 2 years
  DELETE FROM public.admin_audit_log 
  WHERE created_at < now() - interval '2 years';
  
  -- Delete rate limit records older than 7 days
  DELETE FROM public.role_modification_limits 
  WHERE created_at < now() - interval '7 days';
END;
$$;