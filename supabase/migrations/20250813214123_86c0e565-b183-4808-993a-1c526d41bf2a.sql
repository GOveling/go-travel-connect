-- Replace the trips SELECT policy with one that uses security definer functions
DROP POLICY IF EXISTS "Users can view their accessible trips" ON public.trips;

CREATE POLICY "Users can view accessible trips without recursion"
ON public.trips
FOR SELECT
USING (
  -- Must be authenticated
  auth.uid() IS NOT NULL
  AND
  -- Trip is not hidden by this user (using security definer function)
  NOT is_trip_hidden_by_user(trips.id, auth.uid())
  AND
  (
    -- User is the owner
    auth.uid() = user_id 
    OR 
    -- User is an active collaborator (using existing security definer function)
    is_trip_collaborator(trips.id, auth.uid())
    OR 
    -- User has a pending invitation (using security definer function)
    has_pending_invitation_to_trip(trips.id, auth.uid())
  )
);