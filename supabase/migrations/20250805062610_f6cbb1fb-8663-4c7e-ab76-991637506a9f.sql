-- Update existing data to sync is_group_trip with actual collaborators
UPDATE trips 
SET 
  is_group_trip = CASE 
    WHEN (SELECT COUNT(*) FROM trip_collaborators WHERE trip_id = trips.id) > 0 THEN true
    ELSE false
  END,
  collaborators_count = (SELECT COUNT(*) FROM trip_collaborators WHERE trip_id = trips.id),
  updated_at = now()
WHERE is_group_trip != (
  CASE 
    WHEN (SELECT COUNT(*) FROM trip_collaborators WHERE trip_id = trips.id) > 0 THEN true
    ELSE false
  END
);

-- Create or replace the trigger function to automatically update trip group status
CREATE OR REPLACE FUNCTION public.update_trip_group_status()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Drop existing trigger if it exists and create new one
DROP TRIGGER IF EXISTS update_trip_group_status_trigger ON public.trip_collaborators;

CREATE TRIGGER update_trip_group_status_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.trip_collaborators
  FOR EACH ROW
  EXECUTE FUNCTION public.update_trip_group_status();

-- Also create similar trigger for trip_members table for consistency
DROP TRIGGER IF EXISTS update_trip_group_status_members_trigger ON public.trip_members;

CREATE TRIGGER update_trip_group_status_members_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.trip_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_trip_group_status();