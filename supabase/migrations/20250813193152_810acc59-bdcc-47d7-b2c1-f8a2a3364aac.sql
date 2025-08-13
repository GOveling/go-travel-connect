-- Fix remaining database functions to have proper search_path security setting
-- This resolves the security warnings from the linter

-- Fix extract_country_from_destination function
CREATE OR REPLACE FUNCTION public.extract_country_from_destination(destination_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF destination_name IS NULL OR destination_name = '' THEN
    RETURN 'Unknown';
  END IF;
  
  -- Extract country (last part after comma, or whole string if no comma)
  IF position(',' in destination_name) > 0 THEN
    RETURN trim(split_part(destination_name, ',', -1));
  ELSE
    RETURN trim(destination_name);
  END IF;
END;
$$;

-- Fix update_trip_destination_countries function
CREATE OR REPLACE FUNCTION public.update_trip_destination_countries()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  countries_array jsonb;
BEGIN
  -- Get unique countries from all saved places for this trip
  SELECT jsonb_agg(DISTINCT extract_country_from_destination(destination_name))
  INTO countries_array
  FROM saved_places 
  WHERE trip_id = COALESCE(NEW.trip_id, OLD.trip_id)
  AND destination_name IS NOT NULL;
  
  -- If no countries found, set empty array
  IF countries_array IS NULL THEN
    countries_array = '[]'::jsonb;
  END IF;
  
  -- Update the trip's destination column
  UPDATE trips 
  SET destination = countries_array,
      updated_at = now()
  WHERE id = COALESCE(NEW.trip_id, OLD.trip_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Fix calculate_age function
CREATE OR REPLACE FUNCTION public.calculate_age(birth_date date)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF birth_date IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date));
END;
$$;

-- Fix update_age_on_birth_date_change function
CREATE OR REPLACE FUNCTION public.update_age_on_birth_date_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only calculate age if birth_date is actually being updated and is not null
  IF TG_OP = 'UPDATE' AND OLD.birth_date IS DISTINCT FROM NEW.birth_date AND NEW.birth_date IS NOT NULL THEN
    NEW.age = calculate_age(NEW.birth_date);
  END IF;
  RETURN NEW;
END;
$$;