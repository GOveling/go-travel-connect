-- Create table for world cities with IATA codes
CREATE TABLE public.world_cities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  city_name TEXT NOT NULL,
  country_name TEXT NOT NULL,
  country_code TEXT NOT NULL,
  iata_code TEXT NOT NULL,
  airport_name TEXT NOT NULL,
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.world_cities ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access
CREATE POLICY "Anyone can view cities" 
ON public.world_cities 
FOR SELECT 
USING (true);

-- Create indexes for better performance
CREATE INDEX idx_world_cities_city_name ON public.world_cities(city_name);
CREATE INDEX idx_world_cities_country_name ON public.world_cities(country_name);
CREATE INDEX idx_world_cities_iata_code ON public.world_cities(iata_code);
CREATE INDEX idx_world_cities_search ON public.world_cities USING gin(to_tsvector('spanish', city_name || ' ' || country_name || ' ' || airport_name));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_world_cities_updated_at
BEFORE UPDATE ON public.world_cities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();