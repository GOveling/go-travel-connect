-- Add position_order column to saved_places table
ALTER TABLE public.saved_places 
ADD COLUMN position_order INTEGER DEFAULT 0;

-- Create index for efficient querying by trip and position
CREATE INDEX idx_saved_places_trip_position ON public.saved_places(trip_id, position_order);

-- Function to auto-assign position when inserting new saved places
CREATE OR REPLACE FUNCTION public.auto_assign_position()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger to auto-assign positions
CREATE TRIGGER trigger_auto_assign_position
  BEFORE INSERT ON public.saved_places
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_position();

-- Function to reorder positions after deletion
CREATE OR REPLACE FUNCTION public.reorder_saved_places_positions()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger to reorder after deletion
CREATE TRIGGER trigger_reorder_positions_after_delete
  AFTER DELETE ON public.saved_places
  FOR EACH ROW
  EXECUTE FUNCTION public.reorder_saved_places_positions();

-- Update existing records to have proper position_order
UPDATE public.saved_places 
SET position_order = subquery.new_position
FROM (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY trip_id ORDER BY created_at) as new_position
  FROM public.saved_places
) AS subquery
WHERE saved_places.id = subquery.id;