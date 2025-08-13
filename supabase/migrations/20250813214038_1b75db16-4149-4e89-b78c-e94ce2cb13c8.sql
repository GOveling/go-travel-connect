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