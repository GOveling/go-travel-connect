-- Fix security linter warnings by adding SET search_path to functions
CREATE OR REPLACE FUNCTION public.validate_profile_access(profile_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT auth.uid() = profile_id;
$$;

CREATE OR REPLACE FUNCTION public.enforce_profile_security()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Ensure the profile ID always matches the authenticated user
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.id != auth.uid() THEN
      RAISE EXCEPTION 'Access denied: Cannot modify profile for different user';
    END IF;
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION public.validate_profile_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  auth_email text;
BEGIN
  -- Get the authenticated user's email from auth.users
  SELECT email INTO auth_email FROM auth.users WHERE id = auth.uid();
  
  -- If email is being set and doesn't match auth email, log a warning
  IF NEW.email IS NOT NULL AND NEW.email != auth_email THEN
    RAISE WARNING 'Profile email % does not match auth email %', NEW.email, auth_email;
  END IF;
  
  RETURN NEW;
END;
$$;