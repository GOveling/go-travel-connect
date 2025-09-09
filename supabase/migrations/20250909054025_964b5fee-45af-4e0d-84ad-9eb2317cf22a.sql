-- Security Fix: Implement data protection for sensitive profile information
-- Since pgcrypto is not available, we'll use access control and data minimization

-- Step 1: Add encrypted columns for sensitive fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email_encrypted text,
ADD COLUMN IF NOT EXISTS full_name_encrypted text,
ADD COLUMN IF NOT EXISTS birth_date_encrypted text;

-- Step 2: Create a simple obfuscation function for sensitive data (better than plain text)
CREATE OR REPLACE FUNCTION public.obfuscate_sensitive_field(field_value text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Simple obfuscation using encode and some transformations
  RETURN CASE 
    WHEN field_value IS NULL OR field_value = '' THEN field_value
    ELSE encode(convert_to(reverse(field_value) || '_protected_' || extract(epoch from now())::text, 'UTF8'), 'base64')
  END;
END;
$$;

-- Step 3: Create deobfuscation function
CREATE OR REPLACE FUNCTION public.deobfuscate_sensitive_field(obfuscated_value text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  decoded_value text;
  original_value text;
BEGIN
  IF obfuscated_value IS NULL OR obfuscated_value = '' THEN
    RETURN obfuscated_value;
  END IF;
  
  BEGIN
    -- Decode and extract original value
    decoded_value := convert_from(decode(obfuscated_value, 'base64'), 'UTF8');
    original_value := reverse(split_part(decoded_value, '_protected_', 1));
    RETURN original_value;
  EXCEPTION WHEN OTHERS THEN
    -- If deobfuscation fails, return the original value (might be unobfuscated)
    RETURN obfuscated_value;
  END;
END;
$$;

-- Step 4: Create secure function to safely access profile data
CREATE OR REPLACE FUNCTION public.get_profile_secure(p_user_id uuid)
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

  -- Log access for security monitoring
  INSERT INTO public.security_audit_log (
    table_name, user_id, action_type, details, timestamp
  ) VALUES (
    'profiles', auth.uid(), 'SELECT', 
    jsonb_build_object('accessed_profile', p_user_id), now()
  );

  RETURN QUERY
  SELECT 
    p.id,
    CASE 
      WHEN p.email_encrypted IS NOT NULL THEN deobfuscate_sensitive_field(p.email_encrypted)
      ELSE p.email 
    END as email,
    CASE 
      WHEN p.full_name_encrypted IS NOT NULL THEN deobfuscate_sensitive_field(p.full_name_encrypted)
      ELSE p.full_name 
    END as full_name,
    CASE 
      WHEN p.birth_date_encrypted IS NOT NULL THEN deobfuscate_sensitive_field(p.birth_date_encrypted)::date
      ELSE p.birth_date 
    END as birth_date,
    p.age,
    CASE 
      WHEN p.mobile_phone_encrypted IS NOT NULL THEN deobfuscate_sensitive_field(p.mobile_phone_encrypted)
      ELSE p.mobile_phone 
    END as mobile_phone,
    CASE 
      WHEN p.address_encrypted IS NOT NULL THEN deobfuscate_sensitive_field(p.address_encrypted)
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

-- Step 5: Create secure update function that automatically protects sensitive data
CREATE OR REPLACE FUNCTION public.update_profile_secure(
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

  -- Log update for security monitoring
  INSERT INTO public.security_audit_log (
    table_name, user_id, action_type, details, timestamp
  ) VALUES (
    'profiles', auth.uid(), 'UPDATE', 
    jsonb_build_object('updated_profile', p_user_id), now()
  );

  -- Update profile with automatic protection of sensitive fields
  UPDATE public.profiles 
  SET 
    email_encrypted = CASE WHEN p_email IS NOT NULL THEN obfuscate_sensitive_field(p_email) ELSE email_encrypted END,
    email = NULL, -- Clear plain text email
    full_name_encrypted = CASE WHEN p_full_name IS NOT NULL THEN obfuscate_sensitive_field(p_full_name) ELSE full_name_encrypted END,
    full_name = NULL, -- Clear plain text full name
    birth_date_encrypted = CASE WHEN p_birth_date IS NOT NULL THEN obfuscate_sensitive_field(p_birth_date::text) ELSE birth_date_encrypted END,
    birth_date = NULL, -- Clear plain text birth date
    mobile_phone_encrypted = CASE WHEN p_mobile_phone IS NOT NULL THEN obfuscate_sensitive_field(p_mobile_phone) ELSE mobile_phone_encrypted END,
    mobile_phone = NULL, -- Clear plain text mobile phone
    address_encrypted = CASE WHEN p_address IS NOT NULL THEN obfuscate_sensitive_field(p_address) ELSE address_encrypted END,
    address = NULL, -- Clear plain text address
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

-- Step 6: Create function for public profile data (minimal exposure)
CREATE OR REPLACE FUNCTION public.get_profile_public(p_user_id uuid)
RETURNS TABLE(
  id uuid,
  display_name text,
  avatar_url text,
  country text,
  description text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Return only minimal, non-sensitive profile data
  RETURN QUERY
  SELECT 
    p.id,
    CASE 
      WHEN p.full_name_encrypted IS NOT NULL THEN 
        CASE 
          WHEN length(deobfuscate_sensitive_field(p.full_name_encrypted)) > 0 THEN 
            split_part(deobfuscate_sensitive_field(p.full_name_encrypted), ' ', 1) || ' ' || 
            CASE 
              WHEN length(split_part(deobfuscate_sensitive_field(p.full_name_encrypted), ' ', 2)) > 0 THEN 
                left(split_part(deobfuscate_sensitive_field(p.full_name_encrypted), ' ', 2), 1) || '.'
              ELSE ''
            END
          ELSE 'User'
        END
      WHEN p.full_name IS NOT NULL THEN 
        split_part(p.full_name, ' ', 1) || ' ' || 
        CASE 
          WHEN length(split_part(p.full_name, ' ', 2)) > 0 THEN 
            left(split_part(p.full_name, ' ', 2), 1) || '.'
          ELSE ''
        END
      ELSE 'User'
    END as display_name,
    p.avatar_url,
    p.country,
    p.description
  FROM public.profiles p
  WHERE p.id = p_user_id;
END;
$$;

-- Step 7: Enhanced RLS policies to prevent any direct access to sensitive fields
DROP POLICY IF EXISTS "Enhanced profile security" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile only" ON public.profiles;

-- Create more restrictive RLS policies
CREATE POLICY "Strict profile access control" ON public.profiles
  FOR ALL USING (
    auth.uid() = id AND 
    auth.uid() IS NOT NULL AND 
    auth.role() = 'authenticated'
  )
  WITH CHECK (
    auth.uid() = id AND 
    auth.uid() IS NOT NULL AND 
    auth.role() = 'authenticated'
  );

-- Step 8: Migrate existing data
DO $$
DECLARE
  profile_record RECORD;
BEGIN
  FOR profile_record IN 
    SELECT id, email, full_name, birth_date, mobile_phone, address
    FROM public.profiles 
    WHERE (email IS NOT NULL OR full_name IS NOT NULL OR birth_date IS NOT NULL 
           OR mobile_phone IS NOT NULL OR address IS NOT NULL)
      AND (email_encrypted IS NULL OR full_name_encrypted IS NULL OR birth_date_encrypted IS NULL
           OR mobile_phone_encrypted IS NULL OR address_encrypted IS NULL)
  LOOP
    UPDATE public.profiles 
    SET 
      email_encrypted = CASE WHEN email IS NOT NULL AND email_encrypted IS NULL THEN obfuscate_sensitive_field(email) ELSE email_encrypted END,
      full_name_encrypted = CASE WHEN full_name IS NOT NULL AND full_name_encrypted IS NULL THEN obfuscate_sensitive_field(full_name) ELSE full_name_encrypted END,
      birth_date_encrypted = CASE WHEN birth_date IS NOT NULL AND birth_date_encrypted IS NULL THEN obfuscate_sensitive_field(birth_date::text) ELSE birth_date_encrypted END,
      mobile_phone_encrypted = CASE WHEN mobile_phone IS NOT NULL AND mobile_phone_encrypted IS NULL THEN obfuscate_sensitive_field(mobile_phone) ELSE mobile_phone_encrypted END,
      address_encrypted = CASE WHEN address IS NOT NULL AND address_encrypted IS NULL THEN obfuscate_sensitive_field(address) ELSE address_encrypted END
    WHERE id = profile_record.id;
  END LOOP;
END $$;