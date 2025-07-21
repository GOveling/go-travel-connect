
-- Create countries table to store country data from REST Countries API
CREATE TABLE public.countries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  iso_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone_code TEXT NOT NULL,
  region TEXT,
  subregion TEXT,
  flag_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for countries table
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to countries
CREATE POLICY "Anyone can view countries" 
  ON public.countries 
  FOR SELECT 
  USING (true);

-- Create index for faster lookups
CREATE INDEX idx_countries_iso_code ON public.countries(iso_code);
CREATE INDEX idx_countries_name ON public.countries(name);

-- Create trigger to update updated_at column
CREATE TRIGGER update_countries_updated_at
  BEFORE UPDATE ON public.countries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
