-- Fix infinite recursion in RLS policies by using a security definer function
-- First create a security definer function to check if user is collaborator
CREATE OR REPLACE FUNCTION public.is_trip_collaborator(trip_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM trip_collaborators 
    WHERE trip_collaborators.trip_id = $1 
    AND trip_collaborators.user_id = $2
  );
$$;

-- Update RLS policies to use the security definer function
DROP POLICY IF EXISTS "Users can view their own trips or trips they collaborate on" ON public.trips;

CREATE POLICY "Users can view their own trips or collaborative trips" 
ON public.trips 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  public.is_trip_collaborator(id, auth.uid())
);