-- Migrate destination column from text to jsonb array of countries
-- First, create a backup of existing destination data and convert to country array
UPDATE trips 
SET destination = jsonb_build_array(
  CASE 
    WHEN destination LIKE '%,%' THEN 
      trim(split_part(destination, ',', -1))
    ELSE destination
  END
)::text;

-- Now alter the column type to jsonb
ALTER TABLE trips 
ALTER COLUMN destination TYPE jsonb USING destination::jsonb;

-- Create function to extract country from destination_name
CREATE OR REPLACE FUNCTION extract_country_from_destination(destination_name text)
RETURNS text
LANGUAGE plpgsql
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

-- Create function to update trip destination countries
CREATE OR REPLACE FUNCTION update_trip_destination_countries()
RETURNS trigger
LANGUAGE plpgsql
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

-- Create triggers to automatically update destination countries
CREATE TRIGGER update_trip_countries_on_saved_place_insert
  AFTER INSERT ON saved_places
  FOR EACH ROW
  EXECUTE FUNCTION update_trip_destination_countries();

CREATE TRIGGER update_trip_countries_on_saved_place_update
  AFTER UPDATE ON saved_places
  FOR EACH ROW
  EXECUTE FUNCTION update_trip_destination_countries();

CREATE TRIGGER update_trip_countries_on_saved_place_delete
  AFTER DELETE ON saved_places
  FOR EACH ROW
  EXECUTE FUNCTION update_trip_destination_countries();