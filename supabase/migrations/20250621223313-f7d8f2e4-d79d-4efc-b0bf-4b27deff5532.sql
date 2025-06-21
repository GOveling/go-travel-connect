
-- Create trip_coordinates table to store multiple destinations per trip
CREATE TABLE IF NOT EXISTS public.trip_coordinates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  lat NUMERIC,
  lng NUMERIC,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on trip_coordinates
ALTER TABLE public.trip_coordinates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for trip_coordinates (only if they don't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trip_coordinates' AND policyname = 'Users can view coordinates of their trips') THEN
    CREATE POLICY "Users can view coordinates of their trips" 
      ON public.trip_coordinates 
      FOR SELECT 
      USING (EXISTS (
        SELECT 1 FROM public.trips 
        WHERE trips.id = trip_coordinates.trip_id 
        AND trips.user_id = auth.uid()
      ));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trip_coordinates' AND policyname = 'Users can create coordinates for their trips') THEN
    CREATE POLICY "Users can create coordinates for their trips" 
      ON public.trip_coordinates 
      FOR INSERT 
      WITH CHECK (EXISTS (
        SELECT 1 FROM public.trips 
        WHERE trips.id = trip_coordinates.trip_id 
        AND trips.user_id = auth.uid()
      ));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trip_coordinates' AND policyname = 'Users can update coordinates of their trips') THEN
    CREATE POLICY "Users can update coordinates of their trips" 
      ON public.trip_coordinates 
      FOR UPDATE 
      USING (EXISTS (
        SELECT 1 FROM public.trips 
        WHERE trips.id = trip_coordinates.trip_id 
        AND trips.user_id = auth.uid()
      ));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trip_coordinates' AND policyname = 'Users can delete coordinates of their trips') THEN
    CREATE POLICY "Users can delete coordinates of their trips" 
      ON public.trip_coordinates 
      FOR DELETE 
      USING (EXISTS (
        SELECT 1 FROM public.trips 
        WHERE trips.id = trip_coordinates.trip_id 
        AND trips.user_id = auth.uid()
      ));
  END IF;
END $$;

-- Create trip_collaborators table for group trips
CREATE TABLE IF NOT EXISTS public.trip_collaborators (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor',
  name TEXT,
  email TEXT,
  avatar TEXT,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(trip_id, user_id)
);

-- Enable RLS on trip_collaborators
ALTER TABLE public.trip_collaborators ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for trip_collaborators
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trip_collaborators' AND policyname = 'Users can view collaborators of their trips') THEN
    CREATE POLICY "Users can view collaborators of their trips" 
      ON public.trip_collaborators 
      FOR SELECT 
      USING (EXISTS (
        SELECT 1 FROM public.trips 
        WHERE trips.id = trip_collaborators.trip_id 
        AND trips.user_id = auth.uid()
      ) OR user_id = auth.uid());
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trip_collaborators' AND policyname = 'Trip owners can manage collaborators') THEN
    CREATE POLICY "Trip owners can manage collaborators" 
      ON public.trip_collaborators 
      FOR ALL 
      USING (EXISTS (
        SELECT 1 FROM public.trips 
        WHERE trips.id = trip_collaborators.trip_id 
        AND trips.user_id = auth.uid()
      ));
  END IF;
END $$;

-- Create saved_places table for places saved to trips
CREATE TABLE IF NOT EXISTS public.saved_places (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  rating NUMERIC DEFAULT 0,
  image TEXT,
  description TEXT,
  estimated_time TEXT,
  priority TEXT DEFAULT 'medium',
  destination_name TEXT,
  lat NUMERIC,
  lng NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on saved_places
ALTER TABLE public.saved_places ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for saved_places
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'saved_places' AND policyname = 'Users can view saved places of their trips') THEN
    CREATE POLICY "Users can view saved places of their trips" 
      ON public.saved_places 
      FOR SELECT 
      USING (EXISTS (
        SELECT 1 FROM public.trips 
        WHERE trips.id = saved_places.trip_id 
        AND trips.user_id = auth.uid()
      ));
  END IF;
END $$;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'saved_places' AND policyname = 'Users can manage saved places of their trips') THEN
    CREATE POLICY "Users can manage saved places of their trips" 
      ON public.saved_places 
      FOR ALL 
      USING (EXISTS (
        SELECT 1 FROM public.trips 
        WHERE trips.id = saved_places.trip_id 
        AND trips.user_id = auth.uid()
      ));
  END IF;
END $$;

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_trips_user_id ON public.trips(user_id);
CREATE INDEX IF NOT EXISTS idx_trip_coordinates_trip_id ON public.trip_coordinates(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_collaborators_trip_id ON public.trip_collaborators(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_collaborators_user_id ON public.trip_collaborators(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_places_trip_id ON public.saved_places(trip_id);
