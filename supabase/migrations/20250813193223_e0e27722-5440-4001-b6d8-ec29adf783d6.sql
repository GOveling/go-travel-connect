-- Fix remaining database functions to complete security requirements
-- This will fix the remaining function search path warnings

-- Fix auto_assign_position function
CREATE OR REPLACE FUNCTION public.auto_assign_position()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- If position_order is not set, assign the next available position
  IF NEW.position_order IS NULL OR NEW.position_order = 0 THEN
    SELECT COALESCE(MAX(position_order), 0) + 1
    INTO NEW.position_order
    FROM public.saved_places
    WHERE trip_id = NEW.trip_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix reorder_saved_places_positions function
CREATE OR REPLACE FUNCTION public.reorder_saved_places_positions()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Reorder positions for the affected trip
  UPDATE public.saved_places 
  SET position_order = subquery.new_position
  FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY position_order, created_at) as new_position
    FROM public.saved_places 
    WHERE trip_id = OLD.trip_id
  ) AS subquery
  WHERE saved_places.id = subquery.id;
  
  RETURN OLD;
END;
$$;

-- Fix update_collaborators_count function
CREATE OR REPLACE FUNCTION public.update_collaborators_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.trips
    SET 
      collaborators_count = (
        SELECT COUNT(*) FROM public.trip_collaborators 
        WHERE trip_id = NEW.trip_id
      ),
      is_group_trip = true,
      updated_at = now()
    WHERE id = NEW.trip_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.trips
    SET 
      collaborators_count = (
        SELECT COUNT(*) FROM public.trip_collaborators 
        WHERE trip_id = OLD.trip_id
      ),
      updated_at = now()
    WHERE id = OLD.trip_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Fix update_trip_group_status function
CREATE OR REPLACE FUNCTION public.update_trip_group_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Update the trip when collaborator is added/updated
    UPDATE public.trips
    SET 
      collaborators_count = (
        SELECT COUNT(*) FROM public.trip_collaborators 
        WHERE trip_id = NEW.trip_id
      ),
      is_group_trip = true,
      updated_at = now()
    WHERE id = NEW.trip_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Update the trip when collaborator is removed
    UPDATE public.trips
    SET 
      collaborators_count = (
        SELECT COUNT(*) FROM public.trip_collaborators 
        WHERE trip_id = OLD.trip_id
      ),
      is_group_trip = CASE 
        WHEN (SELECT COUNT(*) FROM public.trip_collaborators WHERE trip_id = OLD.trip_id) > 0 THEN true
        ELSE false
      END,
      updated_at = now()
    WHERE id = OLD.trip_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Fix update_trip_members_updated_at function
CREATE OR REPLACE FUNCTION public.update_trip_members_updated_at()
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