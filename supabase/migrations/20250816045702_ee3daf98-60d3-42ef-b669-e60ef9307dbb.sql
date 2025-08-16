-- Create countries table for storing country information and images
CREATE TABLE IF NOT EXISTS public.countries (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  country_name text NOT NULL UNIQUE,
  country_code text UNIQUE,
  image_url text,
  flag_emoji text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to countries
CREATE POLICY "Anyone can view countries" 
ON public.countries 
FOR SELECT 
USING (true);

-- Insert Chile as example
INSERT INTO public.countries (country_name, country_code, image_url, flag_emoji)
VALUES ('Chile', 'CL', '/lovable-uploads/02ed30d0-8ba5-45df-8283-29f109b16623.png', '🇨🇱')
ON CONFLICT (country_name) DO UPDATE SET
  image_url = EXCLUDED.image_url,
  flag_emoji = EXCLUDED.flag_emoji,
  updated_at = now();

-- Add trigger for updated_at
CREATE TRIGGER update_countries_updated_at
BEFORE UPDATE ON public.countries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();