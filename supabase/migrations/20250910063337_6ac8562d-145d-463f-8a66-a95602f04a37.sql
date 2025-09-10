-- Remove visited-related columns from saved_places table
-- This fixes the group trip issue where one person's visit marks the place as visited for everyone

-- First, let's backup any visit data that exists in saved_places but not in place_visits
-- (This is a safety measure to preserve any data)
INSERT INTO place_visits (
  user_id,
  saved_place_id,
  trip_id,
  confirmation_distance,
  location_lat,
  location_lng,
  place_category,
  place_name,
  country,
  region,
  city,
  visited_at
)
SELECT 
  t.user_id,
  sp.id,
  sp.trip_id,
  COALESCE(sp.visit_distance, 50) as confirmation_distance,
  sp.lat,
  sp.lng,
  sp.category,
  sp.name,
  sp.country,
  sp.region,
  sp.city,
  COALESCE(sp.visited_at, sp.created_at) as visited_at
FROM saved_places sp
JOIN trips t ON t.id = sp.trip_id
WHERE sp.visited = true
  AND NOT EXISTS (
    SELECT 1 FROM place_visits pv 
    WHERE pv.saved_place_id = sp.id
  )
ON CONFLICT (user_id, saved_place_id) DO NOTHING;

-- Remove the problematic columns from saved_places
ALTER TABLE saved_places 
DROP COLUMN IF EXISTS visited,
DROP COLUMN IF EXISTS visited_at,
DROP COLUMN IF EXISTS visit_distance;

-- Update the trigger function to not reference these columns
CREATE OR REPLACE FUNCTION public.update_trip_destination_countries()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- Create helper function to check if a place is visited by a specific user
CREATE OR REPLACE FUNCTION public.is_place_visited_by_user(p_saved_place_id uuid, p_user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM place_visits 
    WHERE saved_place_id = p_saved_place_id 
    AND user_id = p_user_id
  );
$function$;

-- Create helper function to get visit info for a user and place
CREATE OR REPLACE FUNCTION public.get_place_visit_info(p_saved_place_id uuid, p_user_id uuid)
 RETURNS TABLE(visited boolean, visited_at timestamp with time zone, confirmation_distance numeric)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    EXISTS (SELECT 1 FROM place_visits WHERE saved_place_id = p_saved_place_id AND user_id = p_user_id) as visited,
    pv.visited_at,
    pv.confirmation_distance
  FROM place_visits pv
  WHERE pv.saved_place_id = p_saved_place_id AND pv.user_id = p_user_id
  LIMIT 1;
$function$;

-- Update the confirm_place_visit function to not update saved_places
CREATE OR REPLACE FUNCTION public.confirm_place_visit(p_saved_place_id uuid, p_confirmation_distance numeric, p_location_lat numeric, p_location_lng numeric)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  saved_place_record RECORD;
  visit_id uuid;
BEGIN
  -- Get saved place details
  SELECT sp.*, t.id as trip_id 
  INTO saved_place_record
  FROM saved_places sp
  JOIN trips t ON t.id = sp.trip_id
  WHERE sp.id = p_saved_place_id
    AND (t.user_id = auth.uid() OR EXISTS (
      SELECT 1 FROM trip_collaborators tc 
      WHERE tc.trip_id = t.id AND tc.user_id = auth.uid()
    ));
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Place not found or access denied');
  END IF;
  
  -- Check if already visited by this user
  IF is_place_visited_by_user(p_saved_place_id, auth.uid()) THEN
    RETURN jsonb_build_object('success', false, 'error', 'Place already visited by you');
  END IF;
  
  -- Create visit record (no longer updating saved_places)
  INSERT INTO place_visits (
    user_id,
    saved_place_id,
    trip_id,
    confirmation_distance,
    location_lat,
    location_lng,
    place_category,
    place_name,
    country,
    region,
    city
  ) VALUES (
    auth.uid(),
    p_saved_place_id,
    saved_place_record.trip_id,
    p_confirmation_distance,
    p_location_lat,
    p_location_lng,
    saved_place_record.category,
    saved_place_record.name,
    saved_place_record.country,
    saved_place_record.region,
    saved_place_record.city
  ) RETURNING id INTO visit_id;
  
  RETURN jsonb_build_object(
    'success', true,
    'visit_id', visit_id,
    'place_name', saved_place_record.name,
    'category', saved_place_record.category
  );
END;
$function$;