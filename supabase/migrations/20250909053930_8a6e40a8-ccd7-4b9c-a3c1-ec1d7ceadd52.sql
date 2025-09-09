-- Security Fix: Enable encryption and protect sensitive profile data
-- Step 1: Enable pgcrypto extension for encryption functions
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Step 2: Add encrypted columns for sensitive fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_encrypted text,
ADD COLUMN IF NOT EXISTS full_name_encrypted text,
ADD COLUMN IF NOT EXISTS birth_date_encrypted text;

-- Step 3: Update the encryption function to use proper pgcrypto
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_field(field_value text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Use pgcrypto extension for encryption with a fixed key (in production, use a proper key management system)
  RETURN CASE 
    WHEN field_value IS NULL OR field_value = '' THEN field_value
    ELSE encode(encrypt(field_value::bytea, 'travel_app_encrypt_key_2024', 'aes'), 'base64')
  END;
END;
$$;

-- Step 4: Update the decryption function to use proper pgcrypto
CREATE OR REPLACE FUNCTION public.decrypt_sensitive_field(encrypted_value text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN CASE 
    WHEN encrypted_value IS NULL OR encrypted_value = '' THEN encrypted_value
    ELSE convert_from(decrypt(decode(encrypted_value, 'base64'), 'travel_app_encrypt_key_2024', 'aes'), 'UTF8')
  END;
END;
$$;

-- Step 5: Migrate existing sensitive data to encrypted format
DO $$
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
END $$;

-- Step 6: Create secure function to safely access profile data with decryption
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