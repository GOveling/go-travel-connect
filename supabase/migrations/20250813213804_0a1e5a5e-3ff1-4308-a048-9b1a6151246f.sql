-- Create a new table to track trips hidden by users
CREATE TABLE IF NOT EXISTS public.trips_hidden_by_user (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  trip_id uuid NOT NULL,
  hidden_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, trip_id)
);

-- Enable RLS on the new table
ALTER TABLE public.trips_hidden_by_user ENABLE ROW LEVEL SECURITY;

-- RLS policies for trips_hidden_by_user
CREATE POLICY "Users can manage their own hidden trips"
ON public.trips_hidden_by_user
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);