-- Fix the accept_trip_invitation function to properly handle the acceptance flow
CREATE OR REPLACE FUNCTION public.accept_trip_invitation(p_token text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  invitation_record record;
  user_email text;
  trip_record record;
BEGIN
  -- Get user email
  SELECT email INTO user_email 
  FROM public.profiles 
  WHERE id = auth.uid();

  IF user_email IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- Get invitation with trip details
  SELECT ti.*, t.name as trip_name, t.user_id as trip_owner_id
  INTO invitation_record
  FROM public.trip_invitations ti
  JOIN public.trips t ON t.id = ti.trip_id
  WHERE ti.token = p_token
  AND ti.status = 'pending'
  AND ti.expires_at > now()
  AND ti.email = user_email;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid, expired, or already processed invitation';
  END IF;

  -- Verify the trip still exists and is accessible
  SELECT * INTO trip_record
  FROM public.trips
  WHERE id = invitation_record.trip_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Trip no longer exists';
  END IF;

  -- Update invitation status
  UPDATE public.trip_invitations
  SET 
    status = 'accepted',
    accepted_at = now(),
    accepted_by = auth.uid(),
    updated_at = now()
  WHERE id = invitation_record.id;

  -- Add user as collaborator
  INSERT INTO public.trip_collaborators (trip_id, user_id, role, email, name)
  VALUES (
    invitation_record.trip_id,
    auth.uid(),
    invitation_record.role,
    user_email,
    (SELECT full_name FROM public.profiles WHERE id = auth.uid())
  )
  ON CONFLICT (trip_id, user_id) DO UPDATE SET
    role = EXCLUDED.role,
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    updated_at = now();

  -- Convert trip to group trip when first collaborator joins
  UPDATE public.trips
  SET 
    is_group_trip = true,
    updated_at = now()
  WHERE id = invitation_record.trip_id
  AND is_group_trip = false;

  RETURN true;
END;
$function$;