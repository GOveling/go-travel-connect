-- Update the is_trip_collaborator function to be more accurate
CREATE OR REPLACE FUNCTION public.is_trip_collaborator(trip_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM trip_collaborators 
    WHERE trip_collaborators.trip_id = $1 
    AND trip_collaborators.user_id = $2
  );
$function$

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

-- Update the trips SELECT policy to exclude hidden trips and be more strict about collaborator status
DROP POLICY IF EXISTS "Users can view their own trips or collaborative trips or invite" ON public.trips;

CREATE POLICY "Users can view their accessible trips"
ON public.trips
FOR SELECT
USING (
  -- Must be authenticated
  auth.uid() IS NOT NULL
  AND
  -- Trip is not hidden by this user
  NOT EXISTS (
    SELECT 1 FROM trips_hidden_by_user 
    WHERE trip_id = trips.id AND user_id = auth.uid()
  )
  AND
  (
    -- User is the owner
    auth.uid() = user_id 
    OR 
    -- User is an active collaborator
    EXISTS (
      SELECT 1 FROM trip_collaborators 
      WHERE trip_id = trips.id AND user_id = auth.uid()
    )
    OR 
    -- User has a pending invitation
    EXISTS (
      SELECT 1 FROM trip_invitations ti
      JOIN profiles p ON p.email = ti.email
      WHERE ti.trip_id = trips.id 
      AND p.id = auth.uid()
      AND ti.status = 'pending'
      AND ti.expires_at > now()
    )
  )
);

-- Add a policy to allow users to "delete" (hide) trips they can no longer access
CREATE POLICY "Users can hide trips from their view"
ON public.trips
FOR DELETE
USING (
  -- User is authenticated
  auth.uid() IS NOT NULL
  AND
  -- User is NOT the owner (owners use the existing delete policy)
  auth.uid() != user_id
  AND
  -- User was previously associated with this trip somehow (had access)
  (
    EXISTS (
      SELECT 1 FROM trip_invitations ti
      JOIN profiles p ON p.email = ti.email
      WHERE ti.trip_id = trips.id 
      AND p.id = auth.uid()
      AND ti.status IN ('accepted', 'declined')
    )
  )
);