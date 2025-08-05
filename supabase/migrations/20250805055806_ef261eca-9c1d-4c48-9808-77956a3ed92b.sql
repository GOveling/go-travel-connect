-- Fix RLS policies for trip_collaborators to allow self-insertion when accepting invitations

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Users can insert themselves as collaborators when accepting inv" ON trip_collaborators;

-- Create a new policy that allows users to insert themselves when they have a valid pending invitation
CREATE POLICY "Users can insert themselves as collaborators when accepting invitation" 
ON public.trip_collaborators 
FOR INSERT 
WITH CHECK (
  user_id = auth.uid() 
  AND EXISTS (
    SELECT 1 
    FROM public.trip_invitations ti
    JOIN public.profiles p ON p.id = auth.uid()
    WHERE ti.trip_id = trip_collaborators.trip_id
    AND ti.email = p.email
    AND ti.status = 'pending'
    AND ti.expires_at > now()
  )
);