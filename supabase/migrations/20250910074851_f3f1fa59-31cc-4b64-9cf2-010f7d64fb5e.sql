-- Add location_type column to distinguish between static and real-time locations
ALTER TABLE public.trip_shared_locations 
ADD COLUMN location_type text NOT NULL DEFAULT 'real_time' CHECK (location_type IN ('static', 'real_time'));

-- Add index for better performance
CREATE INDEX idx_trip_shared_locations_type ON public.trip_shared_locations(location_type);

-- Update existing records to be real_time by default
UPDATE public.trip_shared_locations SET location_type = 'real_time' WHERE location_type IS NULL;