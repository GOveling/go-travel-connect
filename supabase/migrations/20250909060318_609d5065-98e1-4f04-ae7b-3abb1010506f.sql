-- Drop existing function to avoid conflicts
DROP FUNCTION IF EXISTS public.validate_password_strength(text);

-- Recreate with correct return type
CREATE OR REPLACE FUNCTION public.validate_password_strength(password_input text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  min_length constant integer := 8;
  has_upper boolean := false;
  has_lower boolean := false;
  has_digit boolean := false;
  has_special boolean := false;
  validation_errors text[] := ARRAY[]::text[];
  common_passwords text[] := ARRAY[
    'password', '123456', '123456789', 'qwerty', 'abc123', 
    'password123', 'admin', 'letmein', 'welcome', 'monkey',
    '1234567890', 'iloveyou', '123123', 'admin123', 'qwerty123',
    'password1', 'password12', '12345678', 'qwerty12', 'abc12345'
  ];
BEGIN
  -- Check minimum length
  IF length(password_input) < min_length THEN
    validation_errors := array_append(validation_errors, 'Password must be at least 8 characters long');
  END IF;
  
  -- Check character types
  IF password_input ~ '[A-Z]' THEN has_upper := true; END IF;
  IF password_input ~ '[a-z]' THEN has_lower := true; END IF;
  IF password_input ~ '[0-9]' THEN has_digit := true; END IF;
  IF password_input ~ '[^A-Za-z0-9]' THEN has_special := true; END IF;
  
  -- Check against common passwords
  IF lower(password_input) = ANY(common_passwords) THEN
    validation_errors := array_append(validation_errors, 'Password is too common');
  END IF;
  
  -- Require at least 3 of 4 character types
  IF (has_upper::integer + has_lower::integer + has_digit::integer + has_special::integer) < 3 THEN
    validation_errors := array_append(validation_errors, 'Password must contain at least 3 different character types');
  END IF;
  
  RETURN jsonb_build_object(
    'is_valid', (array_length(validation_errors, 1) IS NULL),
    'errors', validation_errors,
    'strength_score', (has_upper::integer + has_lower::integer + has_digit::integer + has_special::integer)
  );
END;
$$;

-- Drop existing table cleanly
DROP TABLE IF EXISTS public.password_validation_log CASCADE;

-- Recreate password validation log table
CREATE TABLE public.password_validation_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  validation_result boolean NOT NULL,
  attempted_at timestamp with time zone DEFAULT now(),
  ip_address inet,
  user_agent text
);

-- Enable RLS
ALTER TABLE public.password_validation_log ENABLE ROW LEVEL SECURITY;

-- Create policies for password validation log
CREATE POLICY "Users can view own password validation logs"
ON public.password_validation_log
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "System can insert password validation logs"
ON public.password_validation_log
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add helpful comments for manual Supabase configuration
COMMENT ON FUNCTION public.validate_password_strength(text) IS 
'Client-side password validation function. 
IMPORTANT: For complete leaked password protection, you must manually enable in Supabase Dashboard:
1. Go to Authentication > Settings
2. Enable "Enable leaked password protection" 
3. Enable "Enable password strength validations"
4. Set minimum password length to 8 characters
This will integrate with HaveIBeenPwned API automatically.';

COMMENT ON TABLE public.password_validation_log IS 
'Logs password validation attempts for security monitoring.';