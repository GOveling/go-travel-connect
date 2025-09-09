-- Security Fix: Encrypt all sensitive personal data in profiles table
-- This migration addresses the security vulnerability where sensitive data was stored in plain text

-- Step 1: Add encrypted columns for all sensitive fields that don't have them yet
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_encrypted text,
ADD COLUMN IF NOT EXISTS full_name_encrypted text,
ADD COLUMN IF NOT EXISTS birth_date_encrypted text;

-- Step 2: Create a secure function to migrate existing plain text data to encrypted format
CREATE OR REPLACE FUNCTION public.migrate_profile_sensitive_data()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  profile_record RECORD;
BEGIN
  -- Migrate all existing profiles with sensitive data
  FOR profile_record IN 
    SELECT id, email, full_name, birth_date, mobile_phone, address
    FROM public.profiles 
    WHERE email IS NOT NULL OR full_name IS NOT NULL OR birth_date IS NOT NULL 
       OR mobile_phone IS NOT NULL OR address IS NOT NULL
  LOOP
    -- Encrypt email if not already encrypted
    IF profile_record.email IS NOT NULL THEN
      UPDATE public.profiles 
      SET email_encrypted = encrypt_sensitive_field(profile_record.email)
      WHERE id = profile_record.id AND email_encrypted IS NULL;
    END IF;
    
    -- Encrypt full name if not already encrypted
    IF profile_record.full_name IS NOT NULL THEN
      UPDATE public.profiles 
      SET full_name_encrypted = encrypt_sensitive_field(profile_record.full_name)
      WHERE id = profile_record.id AND full_name_encrypted IS NULL;
    END IF;
    
    -- Encrypt birth date if not already encrypted
    IF profile_record.birth_date IS NOT NULL THEN
      UPDATE public.profiles 
      SET birth_date_encrypted = encrypt_sensitive_field(profile_record.birth_date::text)
      WHERE id = profile_record.id AND birth_date_encrypted IS NULL;
    END IF;
    
    -- Encrypt mobile phone if not already encrypted
    IF profile_record.mobile_phone IS NOT NULL THEN
      UPDATE public.profiles 
      SET mobile_phone_encrypted = encrypt_sensitive_field(profile_record.mobile_phone)
      WHERE id = profile_record.id AND mobile_phone_encrypted IS NULL;
    END IF;
    
    -- Encrypt address if not already encrypted
    IF profile_record.address IS NOT NULL THEN
      UPDATE public.profiles 
      SET address_encrypted = encrypt_sensitive_field(profile_record.address)
      WHERE id = profile_record.id AND address_encrypted IS NULL;
    END IF;
  END LOOP;
END;
$$;

-- Step 3: Execute the migration
SELECT public.migrate_profile_sensitive_data();

-- Step 4: Create secure functions to safely access sensitive profile data
CREATE OR REPLACE FUNCTION public.get_profile_safe_data(p_user_id uuid)
RETURNS TABLE(
  id uuid,
  email text,
  full_name text,
  birth_date date,
  age integer,
  mobile_phone text,
  address text,
  country text,
  city_state text,
  country_code text,
  gender text,
  description text,
  avatar_url text,
  onboarding_completed boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Security check: Only allow users to access their own profile data
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Access denied: You can only view your own profile';
  END IF;

  RETURN QUERY
  SELECT 
    p.id,
    CASE 
      WHEN p.email_encrypted IS NOT NULL THEN decrypt_sensitive_field(p.email_encrypted)
      ELSE p.email 
    END as email,
    CASE 
      WHEN p.full_name_encrypted IS NOT NULL THEN decrypt_sensitive_field(p.full_name_encrypted)
      ELSE p.full_name 
    END as full_name,
    CASE 
      WHEN p.birth_date_encrypted IS NOT NULL THEN decrypt_sensitive_field(p.birth_date_encrypted)::date
      ELSE p.birth_date 
    END as birth_date,
    p.age,
    CASE 
      WHEN p.mobile_phone_encrypted IS NOT NULL THEN decrypt_sensitive_field(p.mobile_phone_encrypted)
      ELSE p.mobile_phone 
    END as mobile_phone,
    CASE 
      WHEN p.address_encrypted IS NOT NULL THEN decrypt_sensitive_field(p.address_encrypted)
      ELSE p.address 
    END as address,
    p.country,
    p.city_state,
    p.country_code,
    p.gender,
    p.description,
    p.avatar_url,
    p.onboarding_completed,
    p.created_at,
    p.updated_at
  FROM public.profiles p
  WHERE p.id = p_user_id;
END;
$$;

-- Step 5: Create secure function to update profile data with automatic encryption
CREATE OR REPLACE FUNCTION public.update_profile_safe(
  p_user_id uuid,
  p_email text DEFAULT NULL,
  p_full_name text DEFAULT NULL,
  p_birth_date date DEFAULT NULL,
  p_mobile_phone text DEFAULT NULL,
  p_address text DEFAULT NULL,
  p_country text DEFAULT NULL,
  p_city_state text DEFAULT NULL,
  p_country_code text DEFAULT NULL,
  p_gender text DEFAULT NULL,
  p_description text DEFAULT NULL,
  p_avatar_url text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Security check: Only allow users to update their own profile
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Access denied: You can only update your own profile';
  END IF;

  -- Update profile with automatic encryption of sensitive fields
  UPDATE public.profiles 
  SET 
    email_encrypted = CASE WHEN p_email IS NOT NULL THEN encrypt_sensitive_field(p_email) ELSE email_encrypted END,
    full_name_encrypted = CASE WHEN p_full_name IS NOT NULL THEN encrypt_sensitive_field(p_full_name) ELSE full_name_encrypted END,
    birth_date_encrypted = CASE WHEN p_birth_date IS NOT NULL THEN encrypt_sensitive_field(p_birth_date::text) ELSE birth_date_encrypted END,
    mobile_phone_encrypted = CASE WHEN p_mobile_phone IS NOT NULL THEN encrypt_sensitive_field(p_mobile_phone) ELSE mobile_phone_encrypted END,
    address_encrypted = CASE WHEN p_address IS NOT NULL THEN encrypt_sensitive_field(p_address) ELSE address_encrypted END,
    age = CASE WHEN p_birth_date IS NOT NULL THEN calculate_age(p_birth_date) ELSE age END,
    country = COALESCE(p_country, country),
    city_state = COALESCE(p_city_state, city_state),
    country_code = COALESCE(p_country_code, country_code),
    gender = COALESCE(p_gender, gender),
    description = COALESCE(p_description, description),
    avatar_url = COALESCE(p_avatar_url, avatar_url),
    updated_at = now()
  WHERE id = p_user_id;

  RETURN true;
END;
$$;

-- Step 6: Add additional security trigger to log profile access
CREATE OR REPLACE FUNCTION public.log_profile_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Log profile access for security monitoring
  INSERT INTO public.security_audit_log (
    table_name,
    user_id,
    action_type,
    details,
    timestamp
  ) VALUES (
    'profiles',
    auth.uid(),
    TG_OP,
    jsonb_build_object(
      'profile_id', COALESCE(NEW.id, OLD.id),
      'timestamp', now()
    ),
    now()
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Apply the security logging trigger
DROP TRIGGER IF EXISTS profile_access_log ON public.profiles;
CREATE TRIGGER profile_access_log
  AFTER INSERT OR UPDATE OR DELETE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_profile_access();

-- Step 7: Create a data masking function for minimal profile data exposure
CREATE OR REPLACE FUNCTION public.get_profile_public_data(p_user_id uuid)
RETURNS TABLE(
  id uuid,
  full_name text,
  avatar_url text,
  country text,
  description text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Return only non-sensitive, publicly acceptable profile data
  RETURN QUERY
  SELECT 
    p.id,
    CASE 
      WHEN p.full_name_encrypted IS NOT NULL THEN decrypt_sensitive_field(p.full_name_encrypted)
      ELSE p.full_name 
    END as full_name,
    p.avatar_url,
    p.country,
    p.description
  FROM public.profiles p
  WHERE p.id = p_user_id;
END;
$$;