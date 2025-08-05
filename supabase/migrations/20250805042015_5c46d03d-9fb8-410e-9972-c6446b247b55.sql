-- Create function for accepting trip invitations with proper member creation
CREATE OR REPLACE FUNCTION public.accept_trip_invitation(
  invitation_id uuid,
  user_id uuid,
  current_date timestamptz
) 
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
AS $$
BEGIN
  -- Insert member record from invitation data
  INSERT INTO public.trip_collaborators (trip_id, user_id, role, joined_at, email, name)
  SELECT 
    ti.trip_id, 
    accept_trip_invitation.user_id, 
    ti.role, 
    accept_trip_invitation.current_date,
    p.email,
    p.full_name
  FROM public.trip_invitations ti
  JOIN public.profiles p ON p.id = accept_trip_invitation.user_id
  WHERE ti.id = accept_trip_invitation.invitation_id
  ON CONFLICT (trip_id, user_id) DO UPDATE SET
    role = EXCLUDED.role,
    email = EXCLUDED.email,
    name = EXCLUDED.name;

  -- Update invitation status
  UPDATE public.trip_invitations
  SET 
    status = 'accepted',
    accepted_at = accept_trip_invitation.current_date,
    accepted_by = accept_trip_invitation.user_id,
    updated_at = accept_trip_invitation.current_date
  WHERE id = accept_trip_invitation.invitation_id;
  
  -- Update trip to group trip
  UPDATE public.trips
  SET 
    is_group_trip = true,
    updated_at = accept_trip_invitation.current_date
  WHERE id = (SELECT trip_id FROM public.trip_invitations WHERE id = accept_trip_invitation.invitation_id);
END;
$$;