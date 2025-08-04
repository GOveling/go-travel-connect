-- Fix the has_pending_invitation function to only check accepted invitations
-- This will prevent trips from showing in My Trips when invitation is just pending

-- First, drop the policy that depends on the function
DROP POLICY IF EXISTS "Users can view their own trips or collaborative trips or invite" ON trips;

-- Drop and recreate the function
DROP FUNCTION IF EXISTS public.has_pending_invitation(uuid, uuid);

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
    AND ti.status = 'accepted'
    AND ti.expires_at > now()
  );
$$;

COMMENT ON FUNCTION public.has_pending_invitation(uuid, uuid) IS 'Check if user has an ACCEPTED invitation to a trip (renamed function but kept name for compatibility)';

-- Recreate the policy with the updated function
CREATE POLICY "Users can view their own trips or collaborative trips or invite" 
ON trips 
FOR SELECT 
USING ((auth.uid() = user_id) OR is_trip_collaborator(id, auth.uid()) OR has_pending_invitation(id, auth.uid()));