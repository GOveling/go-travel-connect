-- Create policy to allow users to insert themselves as collaborators when accepting invitations
CREATE POLICY "Users can insert themselves as collaborators when accepting invitations" 
ON public.trip_collaborators 
FOR INSERT 
WITH CHECK (
  user_id = auth.uid() 
  AND EXISTS (
    SELECT 1 FROM public.trip_invitations ti
    WHERE ti.trip_id = trip_collaborators.trip_id
    AND ti.email = (SELECT email FROM public.profiles WHERE id = auth.uid())
    AND ti.status = 'pending'
    AND ti.expires_at > now()
  )
);