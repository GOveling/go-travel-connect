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