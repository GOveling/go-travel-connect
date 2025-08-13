-- Create security definer functions to avoid infinite recursion in RLS policies

-- Function to check if a trip is hidden by a user
CREATE OR REPLACE FUNCTION public.is_trip_hidden_by_user(p_trip_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM trips_hidden_by_user 
    WHERE trip_id = p_trip_id AND user_id = p_user_id
  );
$function$

-- Function to check if user has pending invitation
CREATE OR REPLACE FUNCTION public.has_pending_invitation_to_trip(p_trip_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM trip_invitations ti
    JOIN profiles p ON p.email = ti.email
    WHERE ti.trip_id = p_trip_id 
    AND p.id = p_user_id
    AND ti.status = 'pending'
    AND ti.expires_at > now()
  );
$function$