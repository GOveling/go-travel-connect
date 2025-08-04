-- Drop existing policy to update it
DROP POLICY IF EXISTS "Users can view their own trips or collaborative trips" ON public.trips;

-- Create updated policy that allows viewing trips with pending invitations
CREATE POLICY "Users can view their own trips or collaborative trips or invited trips" 
ON public.trips 
FOR SELECT 
USING (
  -- Owner can see their trips
  (auth.uid() = user_id) 
  OR 
  -- Collaborators can see trips they're part of
  is_trip_collaborator(id, auth.uid())
  OR
  -- Users with pending invitations can see basic trip info
  EXISTS (
    SELECT 1 FROM trip_invitations ti
    JOIN profiles p ON p.email = ti.email
    WHERE ti.trip_id = trips.id 
    AND p.id = auth.uid()
    AND ti.status = 'pending'
    AND ti.expires_at > now()
  )
);