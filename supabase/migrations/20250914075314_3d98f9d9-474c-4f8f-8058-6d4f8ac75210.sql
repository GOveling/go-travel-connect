-- Add language preference column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN preferred_language text DEFAULT 'en' CHECK (preferred_language IN ('en', 'es', 'pt', 'fr', 'it', 'zh'));

-- Create index for better performance
CREATE INDEX idx_profiles_preferred_language ON public.profiles(preferred_language);

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.preferred_language IS 'User preferred language for the application interface';