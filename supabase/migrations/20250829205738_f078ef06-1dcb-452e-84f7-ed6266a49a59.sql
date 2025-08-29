-- First, let's review the current policies on profiles table
-- Drop any duplicate/conflicting policies
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can only insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can only update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can only view their own profile data" ON public.profiles;

-- Create clean, simple, and secure RLS policies for profiles
-- Users can only view their own profile
CREATE POLICY "Users can view own profile only" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Users can only insert their own profile
CREATE POLICY "Users can insert own profile only" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile only" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Add additional security: Create a function to validate sensitive data access
CREATE OR REPLACE FUNCTION public.validate_profile_access(profile_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT auth.uid() = profile_id;
$$;

-- Add check to ensure profile ID matches authenticated user for all operations
CREATE OR REPLACE FUNCTION public.enforce_profile_security()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create trigger to enforce profile security
DROP TRIGGER IF EXISTS enforce_profile_security_trigger ON public.profiles;
CREATE TRIGGER enforce_profile_security_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_profile_security();

-- Additional security: Ensure sensitive fields are properly protected
-- Add a constraint to ensure email matches auth user email when possible
CREATE OR REPLACE FUNCTION public.validate_profile_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create trigger for email validation
DROP TRIGGER IF EXISTS validate_profile_email_trigger ON public.profiles;
CREATE TRIGGER validate_profile_email_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.validate_profile_email();