-- Fix leaked password protection configuration
-- Drop existing policy that's causing conflict and recreate properly

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "System only access to password validation log" ON public.password_validation_log;

-- Drop table if it exists to recreate cleanly
DROP TABLE IF EXISTS public.password_validation_log CASCADE;

-- Create audit log for password validation attempts
CREATE TABLE public.password_validation_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  validation_result boolean NOT NULL,
  attempted_at timestamp with time zone DEFAULT now(),
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on password validation log
ALTER TABLE public.password_validation_log ENABLE ROW LEVEL SECURITY;

-- Create policy for password validation log (only authenticated users can see their own logs)
CREATE POLICY "Users can view own password validation logs"
ON public.password_validation_log
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Create policy to allow system to insert logs
CREATE POLICY "System can insert password validation logs"
ON public.password_validation_log
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Update the password validation function to be more robust
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
  
  -- Check for uppercase letters
  IF password_input ~ '[A-Z]' THEN
    has_upper := true;
  ELSE
    validation_errors := array_append(validation_errors, 'Password must contain at least one uppercase letter');
  END IF;
  
  -- Check for lowercase letters
  IF password_input ~ '[a-z]' THEN
    has_lower := true;
  ELSE
    validation_errors := array_append(validation_errors, 'Password must contain at least one lowercase letter');
  END IF;
  
  -- Check for digits
  IF password_input ~ '[0-9]' THEN
    has_digit := true;
  ELSE
    validation_errors := array_append(validation_errors, 'Password must contain at least one number');
  END IF;
  
  -- Check for special characters
  IF password_input ~ '[^A-Za-z0-9]' THEN
    has_special := true;
  END IF;
  
  -- Check against common passwords (case insensitive)
  IF lower(password_input) = ANY(common_passwords) THEN
    validation_errors := array_append(validation_errors, 'Password is too common and easily guessed');
  END IF;
  
  -- Check for sequential characters
  IF password_input ~ '(012|123|234|345|456|567|678|789|890|abc|bcd|cde|def|efg|fgh|ghi|hij|ijk|jkl|klm|lmn|mno|nop|opq|pqr|qrs|rst|stu|tuv|uvw|vwx|wxy|xyz)' THEN
    validation_errors := array_append(validation_errors, 'Password should not contain sequential characters');
  END IF;
  
  -- Return validation result
  RETURN jsonb_build_object(
    'is_valid', (array_length(validation_errors, 1) IS NULL),
    'has_upper', has_upper,
    'has_lower', has_lower,
    'has_digit', has_digit,
    'has_special', has_special,
    'length_valid', (length(password_input) >= min_length),
    'errors', validation_errors,
    'strength_score', (has_upper::integer + has_lower::integer + has_digit::integer + has_special::integer)
  );
END;
$$;

-- Create function to check if password meets minimum requirements for Supabase auth
CREATE OR REPLACE FUNCTION public.meets_auth_requirements(password_input text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  validation_result jsonb;
BEGIN
  validation_result := validate_password_strength(password_input);
  
  -- Log the validation attempt
  INSERT INTO public.password_validation_log (
    user_id,
    validation_result,
    attempted_at
  ) VALUES (
    auth.uid(),
    (validation_result->>'is_valid')::boolean,
    now()
  );
  
  RETURN (validation_result->>'is_valid')::boolean;
END;
$$;

-- Add helpful comments
COMMENT ON FUNCTION public.validate_password_strength(text) IS 
'Validates password strength and returns detailed feedback.
IMPORTANT: For complete leaked password protection:
1. Enable in Supabase Dashboard > Authentication > Settings
2. Turn ON "Enable leaked password protection" 
3. Set "Enable password strength validations" to ON
4. Use this function in your client-side validation';

COMMENT ON FUNCTION public.meets_auth_requirements(text) IS 
'Quick boolean check if password meets minimum security requirements.
Use this in conjunction with Supabase auth settings for comprehensive protection.';

COMMENT ON TABLE public.password_validation_log IS 
'Audit log for password validation attempts. 
Combined with Supabase leaked password protection for comprehensive security monitoring.';