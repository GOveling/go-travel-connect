-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view their own trips or collaborative trips or invited trips" ON public.trips;

-- Create a security definer function to check if user has pending invitation
CREATE OR REPLACE FUNCTION public.has_pending_invitation(trip_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM trip_invitations ti
    JOIN profiles p ON p.email = ti.email
    WHERE ti.trip_id = $1 
    AND p.id = $2
    AND ti.status = 'pending'
    AND ti.expires_at > now()
  );
$$;

-- Recreate the policy using the security definer function
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
  has_pending_invitation(id, auth.uid())
);