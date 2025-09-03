-- Fix security warnings from the linter

-- Fix function search path issues by setting secure search_path
CREATE OR REPLACE FUNCTION public.validate_profile_owner()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure user can only modify their own profile
  IF NEW.id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied: Cannot modify profile for different user';
  END IF;
  
  -- Log profile access for security monitoring (simplified for now)
  INSERT INTO public.security_audit_log (
    table_name, 
    user_id, 
    action_type, 
    timestamp
  ) VALUES (
    'profiles',
    auth.uid(),
    TG_OP,
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix encrypt function search path
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_field(field_value TEXT)
RETURNS TEXT AS $$
BEGIN
  -- Use pgcrypto extension for encryption
  RETURN CASE 
    WHEN field_value IS NULL OR field_value = '' THEN field_value
    ELSE encode(encrypt(field_value::bytea, 'encryption_key', 'aes'), 'base64')
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix decrypt function search path
CREATE OR REPLACE FUNCTION public.decrypt_sensitive_field(encrypted_value TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN CASE 
    WHEN encrypted_value IS NULL OR encrypted_value = '' THEN encrypted_value
    ELSE convert_from(decrypt(decode(encrypted_value, 'base64'), 'encryption_key', 'aes'), 'UTF8')
  END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Fix cleanup function search path
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  -- Delete audit logs older than 90 days
  DELETE FROM public.security_audit_log 
  WHERE timestamp < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Move pgcrypto extension from public schema to extensions schema
DROP EXTENSION IF EXISTS pgcrypto;
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;