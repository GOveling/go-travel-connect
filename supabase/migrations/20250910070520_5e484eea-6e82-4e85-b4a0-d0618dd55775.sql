-- Create table for shared locations in trips
CREATE TABLE IF NOT EXISTS public.trip_shared_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL,
  user_id UUID NOT NULL,
  lat NUMERIC NOT NULL,
  lng NUMERIC NOT NULL,
  shared_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.trip_shared_locations ENABLE ROW LEVEL SECURITY;

-- Create policies for trip shared locations
CREATE POLICY "Trip members can view shared locations" 
ON public.trip_shared_locations 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM trips t 
    WHERE t.id = trip_shared_locations.trip_id 
    AND (t.user_id = auth.uid() OR is_trip_collaborator(t.id, auth.uid()))
  )
);

CREATE POLICY "Trip members can create their own shared locations" 
ON public.trip_shared_locations 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM trips t 
    WHERE t.id = trip_shared_locations.trip_id 
    AND (t.user_id = auth.uid() OR is_trip_collaborator(t.id, auth.uid()))
  )
);

CREATE POLICY "Users can update their own shared locations" 
ON public.trip_shared_locations 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shared locations" 
ON public.trip_shared_locations 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_trip_shared_locations_updated_at
BEFORE UPDATE ON public.trip_shared_locations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for performance
CREATE INDEX idx_trip_shared_locations_trip_id ON public.trip_shared_locations(trip_id);
CREATE INDEX idx_trip_shared_locations_expires_at ON public.trip_shared_locations(expires_at);

-- Add cleanup function for expired locations
CREATE OR REPLACE FUNCTION public.cleanup_expired_shared_locations()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.trip_shared_locations 
  WHERE expires_at < now();
END;
$function$;