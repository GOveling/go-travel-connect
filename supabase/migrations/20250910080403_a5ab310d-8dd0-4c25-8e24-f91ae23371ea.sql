-- Create a function to safely get basic profile info for trip collaborators
CREATE OR REPLACE FUNCTION public.get_collaborator_profile_safe(p_user_id uuid)
RETURNS TABLE(id uuid, full_name text, avatar_url text)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = 'public'
AS $function$
  SELECT pr.id, pr.full_name, pr.avatar_url
  FROM public.profiles pr
  WHERE pr.id = p_user_id
  AND (
    -- Only return data if users are trip collaborators or the requesting user owns the profile
    auth.uid() = p_user_id
    OR EXISTS (
      SELECT 1 FROM trip_collaborators tc1
      JOIN trip_collaborators tc2 ON tc1.trip_id = tc2.trip_id
      WHERE tc1.user_id = auth.uid() 
      AND tc2.user_id = p_user_id
    )
    OR EXISTS (
      SELECT 1 FROM trips t
      JOIN trip_collaborators tc ON tc.trip_id = t.id
      WHERE t.user_id = auth.uid()
      AND tc.user_id = p_user_id
    )
    OR EXISTS (
      SELECT 1 FROM trips t
      JOIN trip_collaborators tc ON tc.trip_id = t.id
      WHERE t.user_id = p_user_id
      AND tc.user_id = auth.uid()
    )
  );
$function$;