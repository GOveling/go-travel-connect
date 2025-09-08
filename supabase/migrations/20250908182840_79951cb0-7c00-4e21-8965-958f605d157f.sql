-- Add visit tracking fields to saved_places table
ALTER TABLE public.saved_places 
ADD COLUMN visited boolean NOT NULL DEFAULT false,
ADD COLUMN visited_at timestamp with time zone,
ADD COLUMN visit_distance numeric;

-- Create place_visits table for detailed visit tracking
CREATE TABLE public.place_visits (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  saved_place_id uuid NOT NULL,
  trip_id uuid NOT NULL,
  visited_at timestamp with time zone NOT NULL DEFAULT now(),
  confirmation_distance numeric NOT NULL,
  location_lat numeric NOT NULL,
  location_lng numeric NOT NULL,
  place_category text,
  place_name text NOT NULL,
  country text,
  region text,
  city text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on place_visits
ALTER TABLE public.place_visits ENABLE ROW LEVEL SECURITY;

-- Create policies for place_visits
CREATE POLICY "Users can create their own place visits" 
ON public.place_visits 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own place visits" 
ON public.place_visits 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own place visits" 
ON public.place_visits 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own place visits" 
ON public.place_visits 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX idx_place_visits_user_id ON public.place_visits(user_id);
CREATE INDEX idx_place_visits_trip_id ON public.place_visits(trip_id);
CREATE INDEX idx_place_visits_visited_at ON public.place_visits(visited_at);
CREATE INDEX idx_saved_places_visited ON public.saved_places(visited);

-- Add category-specific stats to user_stats
ALTER TABLE public.user_stats 
ADD COLUMN restaurants_visited integer DEFAULT 0,
ADD COLUMN museums_visited integer DEFAULT 0,
ADD COLUMN attractions_visited integer DEFAULT 0,
ADD COLUMN hotels_visited integer DEFAULT 0,
ADD COLUMN parks_visited integer DEFAULT 0,
ADD COLUMN shops_visited integer DEFAULT 0,
ADD COLUMN landmarks_visited integer DEFAULT 0,
ADD COLUMN other_places_visited integer DEFAULT 0;

-- Function to update user stats when a place is visited
CREATE OR REPLACE FUNCTION public.update_user_stats_on_visit()
RETURNS TRIGGER AS $$
DECLARE
  place_category text;
  place_country text;
  place_city text;
BEGIN
  -- Get place details
  SELECT category, country, city INTO place_category, place_country, place_city
  FROM saved_places WHERE id = NEW.saved_place_id;
  
  -- Update general stats
  UPDATE user_stats 
  SET places_visited = places_visited + 1,
      updated_at = now()
  WHERE user_id = NEW.user_id;
  
  -- Update category-specific stats
  IF place_category IS NOT NULL THEN
    CASE lower(place_category)
      WHEN 'restaurant' THEN
        UPDATE user_stats SET restaurants_visited = restaurants_visited + 1 WHERE user_id = NEW.user_id;
      WHEN 'museum' THEN
        UPDATE user_stats SET museums_visited = museums_visited + 1 WHERE user_id = NEW.user_id;
      WHEN 'tourist_attraction' THEN
        UPDATE user_stats SET attractions_visited = attractions_visited + 1 WHERE user_id = NEW.user_id;
      WHEN 'lodging' THEN
        UPDATE user_stats SET hotels_visited = hotels_visited + 1 WHERE user_id = NEW.user_id;
      WHEN 'park' THEN
        UPDATE user_stats SET parks_visited = parks_visited + 1 WHERE user_id = NEW.user_id;
      WHEN 'store' THEN
        UPDATE user_stats SET shops_visited = shops_visited + 1 WHERE user_id = NEW.user_id;
      WHEN 'establishment' THEN
        UPDATE user_stats SET landmarks_visited = landmarks_visited + 1 WHERE user_id = NEW.user_id;
      ELSE
        UPDATE user_stats SET other_places_visited = other_places_visited + 1 WHERE user_id = NEW.user_id;
    END CASE;
  END IF;
  
  -- Check for country/city achievements
  IF place_country IS NOT NULL THEN
    -- Count unique countries visited
    UPDATE user_stats 
    SET countries_visited = (
      SELECT COUNT(DISTINCT country) 
      FROM place_visits 
      WHERE user_id = NEW.user_id AND country IS NOT NULL
    )
    WHERE user_id = NEW.user_id;
  END IF;
  
  IF place_city IS NOT NULL THEN
    -- Count unique cities visited
    UPDATE user_stats 
    SET cities_explored = (
      SELECT COUNT(DISTINCT city) 
      FROM place_visits 
      WHERE user_id = NEW.user_id AND city IS NOT NULL
    )
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for stats updates
CREATE TRIGGER update_user_stats_on_place_visit
  AFTER INSERT ON public.place_visits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_stats_on_visit();

-- Function to confirm place visit
CREATE OR REPLACE FUNCTION public.confirm_place_visit(
  p_saved_place_id uuid,
  p_confirmation_distance numeric,
  p_location_lat numeric,
  p_location_lng numeric
) RETURNS jsonb AS $$
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
  
  -- Check if already visited
  IF saved_place_record.visited THEN
    RETURN jsonb_build_object('success', false, 'error', 'Place already visited');
  END IF;
  
  -- Update saved_places as visited
  UPDATE saved_places 
  SET visited = true,
      visited_at = now(),
      visit_distance = p_confirmation_distance
  WHERE id = p_saved_place_id;
  
  -- Create visit record
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;