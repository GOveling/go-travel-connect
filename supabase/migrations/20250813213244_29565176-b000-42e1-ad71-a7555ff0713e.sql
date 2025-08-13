-- Update the is_trip_collaborator function to be more accurate
CREATE OR REPLACE FUNCTION public.is_trip_collaborator(trip_id uuid, user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM trip_collaborators 
    WHERE trip_collaborators.trip_id = $1 
    AND trip_collaborators.user_id = $2
  );
$function$