-- Security Fix: Restrict access to trip_invitations table to prevent email harvesting
-- This addresses the security finding: "Customer Email Addresses Could Be Stolen by Hackers"

-- First, drop existing SELECT policies that might be too permissive
DROP POLICY IF EXISTS "Stricter invitation access" ON public.trip_invitations;
DROP POLICY IF EXISTS "Users can view invitations sent to them" ON public.trip_invitations;

-- Create a more secure SELECT policy that strictly limits access
CREATE POLICY "Secure invitation access" ON public.trip_invitations
FOR SELECT
TO authenticated
USING (
  -- Only trip owners can see invitations for their trips
  (EXISTS (
    SELECT 1 FROM public.trips 
    WHERE trips.id = trip_invitations.trip_id 
    AND trips.user_id = auth.uid()
  ))
  OR
  -- Only invited users can see their own pending invitations
  (
    trip_invitations.email = (
      SELECT profiles.email 
      FROM public.profiles 
      WHERE profiles.id = auth.uid()
    )
    AND trip_invitations.status = 'pending'
    AND trip_invitations.expires_at > now()
  )
);

-- Ensure UPDATE policy is also secure for invitation acceptance
DROP POLICY IF EXISTS "Users can accept their own invitations" ON public.trip_invitations;

CREATE POLICY "Users can accept only their own invitations" ON public.trip_invitations
FOR UPDATE
TO authenticated
USING (
  -- User can only update invitations sent to their email
  trip_invitations.email = (
    SELECT profiles.email 
    FROM public.profiles 
    WHERE profiles.id = auth.uid()
  )
  AND trip_invitations.status = 'pending'
  AND trip_invitations.expires_at > now()
)
WITH CHECK (
  -- Only allow changing status to accepted or declined
  trip_invitations.status IN ('accepted', 'declined')
);

-- Add additional security: Create a function to safely get pending invitations
-- This prevents direct table access and adds an extra security layer
CREATE OR REPLACE FUNCTION public.get_user_pending_invitations()
RETURNS TABLE(
  id uuid,
  trip_id uuid,
  trip_name text,
  inviter_name text,
  role text,
  created_at timestamp with time zone,
  expires_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_email text;
BEGIN
  -- Get the authenticated user's email
  SELECT email INTO user_email 
  FROM public.profiles 
  WHERE id = auth.uid();
  
  -- Return only invitations for this user's email that are pending and not expired
  RETURN QUERY
  SELECT 
    ti.id,
    ti.trip_id,
    t.name as trip_name,
    p.full_name as inviter_name,
    ti.role,
    ti.created_at,
    ti.expires_at
  FROM public.trip_invitations ti
  JOIN public.trips t ON t.id = ti.trip_id
  JOIN public.profiles p ON p.id = ti.inviter_id
  WHERE ti.email = user_email
    AND ti.status = 'pending'
    AND ti.expires_at > now()
  ORDER BY ti.created_at DESC;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.get_user_pending_invitations() TO authenticated;