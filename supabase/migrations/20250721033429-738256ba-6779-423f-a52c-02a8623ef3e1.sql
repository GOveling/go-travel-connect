-- Create all_cities table for world cities data
CREATE TABLE public.all_cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city TEXT NOT NULL,
  city_ascii TEXT,
  lat NUMERIC,
  lng NUMERIC,
  country TEXT,
  iso2 TEXT,
  iso3 TEXT,
  admin_name TEXT,
  capital TEXT,
  population BIGINT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.all_cities ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Anyone can view cities" 
ON public.all_cities 
FOR SELECT 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_all_cities_country ON public.all_cities(country);
CREATE INDEX idx_all_cities_iso2 ON public.all_cities(iso2);
CREATE INDEX idx_all_cities_city ON public.all_cities(city);
CREATE INDEX idx_all_cities_lat_lng ON public.all_cities(lat, lng);
CREATE INDEX idx_all_cities_population ON public.all_cities(population);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_all_cities_updated_at
BEFORE UPDATE ON public.all_cities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();