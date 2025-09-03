-- Phase 1: Strengthen RLS policies for sensitive data tables

-- Enhance profiles table security with additional validation
CREATE OR REPLACE FUNCTION public.validate_profile_owner()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure user can only modify their own profile
  IF NEW.id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: Cannot modify profile for different user';
  END IF;
  
  -- Log profile access for security monitoring
  INSERT INTO public.security_audit_log (
    table_name, 
    user_id, 
    action_type, 
    timestamp,
    ip_address
  ) VALUES (
    'profiles',
    auth.uid(),
    TG_OP,
    NOW(),
    current_setting('request.headers', true)::json->>'x-forwarded-for'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create security audit log table for monitoring
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  user_id UUID,
  action_type TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  ip_address TEXT,
  details JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on audit log
ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only allow viewing own audit logs
CREATE POLICY "Users can view their own audit logs"
ON public.security_audit_log
FOR SELECT
USING (auth.uid() = user_id);

-- Create trigger for profile validation
DROP TRIGGER IF EXISTS validate_profile_owner_trigger ON public.profiles;
CREATE TRIGGER validate_profile_owner_trigger
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.validate_profile_owner();

-- Add additional RLS policy for profiles with stricter validation
DROP POLICY IF EXISTS "Enhanced profile security" ON public.profiles;
CREATE POLICY "Enhanced profile security"
ON public.profiles
FOR ALL
USING (
  auth.uid() = id 
  AND auth.uid() IS NOT NULL
  AND auth.role() = 'authenticated'
)
WITH CHECK (
  auth.uid() = id 
  AND auth.uid() IS NOT NULL
  AND auth.role() = 'authenticated'
);

-- Strengthen trip_invitations RLS policies
DROP POLICY IF EXISTS "Stricter invitation access" ON public.trip_invitations;
CREATE POLICY "Stricter invitation access"
ON public.trip_invitations
FOR SELECT
USING (
  -- Only trip owners or invited users can see invitations
  (EXISTS (
    SELECT 1 FROM trips 
    WHERE trips.id = trip_invitations.trip_id 
    AND trips.user_id = auth.uid()
  ))
  OR 
  (email = (
    SELECT email FROM profiles 
    WHERE id = auth.uid()
  ) AND status = 'pending' AND expires_at > NOW())
);

-- Enhance place_reviews RLS for privacy
DROP POLICY IF EXISTS "Enhanced review privacy" ON public.place_reviews;
CREATE POLICY "Enhanced review privacy"
ON public.place_reviews
FOR SELECT
USING (
  -- Users can only see their own reviews or public non-anonymous reviews
  auth.uid() = user_id 
  OR (anonymous = false AND rating >= 1)
);

-- Strengthen trip_collaborators access
DROP POLICY IF EXISTS "Strict collaborator access" ON public.trip_collaborators;
CREATE POLICY "Strict collaborator access"
ON public.trip_collaborators
FOR SELECT
USING (
  -- Only if user is trip owner or is the collaborator themselves
  EXISTS (
    SELECT 1 FROM trips 
    WHERE trips.id = trip_collaborators.trip_id 
    AND trips.user_id = auth.uid()
  )
  OR user_id = auth.uid()
);

-- Create function to encrypt sensitive data
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_field(field_value TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Use pgcrypto extension for encryption
  RETURN CASE 
    WHEN field_value IS NULL OR field_value = '' THEN field_value
    ELSE encode(encrypt(field_value::bytea, 'encryption_key', 'aes'), 'base64')
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to decrypt sensitive data
CREATE OR REPLACE FUNCTION public.decrypt_sensitive_field(encrypted_value TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE 
    WHEN encrypted_value IS NULL OR encrypted_value = '' THEN encrypted_value
    ELSE convert_from(decrypt(decode(encrypted_value, 'base64'), 'encryption_key', 'aes'), 'UTF8')
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add encrypted columns for sensitive data (keeping originals for now)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS mobile_phone_encrypted TEXT,
ADD COLUMN IF NOT EXISTS address_encrypted TEXT;

-- Create function to handle data minimization
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  -- Delete audit logs older than 90 days
  DELETE FROM public.security_audit_log 
  WHERE timestamp < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable the pgcrypto extension for encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto;