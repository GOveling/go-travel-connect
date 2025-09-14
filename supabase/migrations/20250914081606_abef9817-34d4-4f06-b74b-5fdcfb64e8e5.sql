-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.get_globally_popular_places(hours_ago integer DEFAULT 1)
RETURNS TABLE(
  name text,
  category text,
  formatted_address text,
  lat numeric,
  lng numeric,
  save_count bigint,
  country text,
  city text,
  description text,
  image text
)
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    sp.name,
    sp.category,
    sp.formatted_address,
    sp.lat,
    sp.lng,
    COUNT(*) as save_count,
    sp.country,
    sp.city,
    sp.description,
    sp.image
  FROM public.saved_places sp
  WHERE sp.created_at >= NOW() - (hours_ago || ' hours')::INTERVAL
    AND sp.name IS NOT NULL
    AND sp.lat IS NOT NULL
    AND sp.lng IS NOT NULL
  GROUP BY sp.name, sp.category, sp.formatted_address, sp.lat, sp.lng, sp.country, sp.city, sp.description, sp.image
  ORDER BY save_count DESC, sp.name ASC
  LIMIT 3;
END;
$function$