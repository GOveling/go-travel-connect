-- Fix column ambiguity in get_user_pending_invitations function
DROP FUNCTION IF EXISTS public.get_user_pending_invitations();

CREATE OR REPLACE FUNCTION public.get_user_pending_invitations()
 RETURNS TABLE(invitation_id uuid, trip_id uuid, trip_name text, inviter_name text, role text, created_at timestamp with time zone, expires_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    ti.id as invitation_id,
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
$function$