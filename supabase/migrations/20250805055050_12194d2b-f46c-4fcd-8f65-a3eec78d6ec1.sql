-- Create improved invitation acceptance function
CREATE OR REPLACE FUNCTION public.accept_trip_invitation_v3(
  p_token text
) 
RETURNS jsonb 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  invitation_record RECORD;
  user_profile RECORD;
BEGIN
  -- Get user email and profile
  SELECT email, full_name, id INTO user_profile
  FROM public.profiles 
  WHERE id = auth.uid();

  IF user_profile.email IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User profile not found'
    );
  END IF;

  -- Get invitation with trip details
  SELECT ti.*, t.name as trip_name, t.user_id as trip_owner_id
  INTO invitation_record
  FROM public.trip_invitations ti
  JOIN public.trips t ON t.id = ti.trip_id
  WHERE ti.token = p_token
  AND ti.status = 'pending'
  AND ti.expires_at > now()
  AND ti.email = user_profile.email;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid, expired, or already processed invitation'
    );
  END IF;

  -- Add user as collaborator in trip_collaborators (primary table)
  INSERT INTO public.trip_collaborators (
    trip_id, 
    user_id, 
    role, 
    email, 
    name,
    joined_at
  ) VALUES (
    invitation_record.trip_id,
    auth.uid(),
    invitation_record.role,
    user_profile.email,
    user_profile.full_name,
    now()
  )
  ON CONFLICT (trip_id, user_id) DO UPDATE SET
    role = EXCLUDED.role,
    email = EXCLUDED.email,
    name = EXCLUDED.name,
    joined_at = EXCLUDED.joined_at;

  -- Also add to trip_members for compatibility
  INSERT INTO public.trip_members (
    trip_id, 
    user_id, 
    role,
    created_at
  ) VALUES (
    invitation_record.trip_id,
    auth.uid(),
    invitation_record.role,
    now()
  )
  ON CONFLICT (trip_id, user_id) DO UPDATE SET
    role = EXCLUDED.role,
    updated_at = now();

  -- Update invitation status
  UPDATE public.trip_invitations
  SET 
    status = 'accepted',
    accepted_at = now(),
    accepted_by = auth.uid(),
    updated_at = now()
  WHERE id = invitation_record.id;

  -- Update trip type to group
  UPDATE public.trips
  SET 
    type = 'group',
    is_group_trip = true,
    updated_at = now()
  WHERE id = invitation_record.trip_id;

  RETURN jsonb_build_object(
    'success', true,
    'trip_id', invitation_record.trip_id,
    'trip_name', invitation_record.trip_name,
    'role', invitation_record.role
  );
END;
$$;

-- Configure realtime for trip_collaborators
ALTER TABLE public.trip_collaborators REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_collaborators;