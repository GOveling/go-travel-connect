-- Recreate the function with correct order of operations for RLS compliance
CREATE OR REPLACE FUNCTION public.accept_trip_invitation(
  invitation_id uuid,
  user_id uuid,
  accepted_date timestamptz
) 
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  invitation_record RECORD;
BEGIN
  -- First, get the invitation details while it's still pending
  SELECT * INTO invitation_record
  FROM public.trip_invitations 
  WHERE id = invitation_id
  AND status = 'pending'
  AND expires_at > accepted_date;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid or expired invitation';
  END IF;
  
  -- Insert member record using the invitation data (this must happen while invitation is still pending for RLS)
  INSERT INTO public.trip_collaborators (trip_id, user_id, role, joined_at, email, name)
  SELECT 
    invitation_record.trip_id, 
    accept_trip_invitation.user_id, 
    invitation_record.role, 
    accept_trip_invitation.accepted_date,
    p.email,
    p.full_name
  FROM public.profiles p
  WHERE p.id = accept_trip_invitation.user_id
  ON CONFLICT (trip_id, user_id) DO UPDATE SET
    role = EXCLUDED.role,
    email = EXCLUDED.email,
    name = EXCLUDED.name;

  -- Now update invitation status after successful insertion
  UPDATE public.trip_invitations
  SET 
    status = 'accepted',
    accepted_at = accept_trip_invitation.accepted_date,
    accepted_by = accept_trip_invitation.user_id,
    updated_at = accept_trip_invitation.accepted_date
  WHERE id = invitation_id;
  
  -- Update trip to group trip
  UPDATE public.trips
  SET 
    is_group_trip = true,
    updated_at = accept_trip_invitation.accepted_date
  WHERE id = invitation_record.trip_id;
END;
$$;