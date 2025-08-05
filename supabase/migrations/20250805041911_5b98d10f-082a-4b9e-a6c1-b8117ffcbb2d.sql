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
    user_id, 
    ti.role, 
    current_date,
    p.email,
    p.full_name
  FROM public.trip_invitations ti
  JOIN public.profiles p ON p.id = user_id
  WHERE ti.id = invitation_id
  ON CONFLICT (trip_id, user_id) DO UPDATE SET
    role = EXCLUDED.role,
    email = EXCLUDED.email,
    name = EXCLUDED.name;

  -- Update invitation status
  UPDATE public.trip_invitations
  SET 
    status = 'accepted',
    accepted_at = current_date,
    accepted_by = user_id,
    updated_at = current_date
  WHERE id = invitation_id;
  
  -- Update trip to group trip
  UPDATE public.trips
  SET 
    is_group_trip = true,
    updated_at = current_date
  WHERE id = (SELECT trip_id FROM public.trip_invitations WHERE id = invitation_id);
END;
$$;