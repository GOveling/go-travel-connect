-- Remove overly permissive public read access on profiles
ALTER TABLE public.profiles DROP POLICY IF EXISTS "Public can view profiles";

-- Allow securely fetching a user's profile for a specific trip context
CREATE OR REPLACE FUNCTION public.get_trip_user_profile(p_trip_id uuid, p_user_id uuid)
RETURNS TABLE (id uuid, full_name text, email text, avatar_url text)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT pr.id, pr.full_name, pr.email, pr.avatar_url
  FROM public.profiles pr
  WHERE pr.id = p_user_id
    AND (
      EXISTS (SELECT 1 FROM public.trips t WHERE t.id = p_trip_id AND (t.user_id = auth.uid()))
      OR EXISTS (SELECT 1 FROM public.trip_collaborators tc WHERE tc.trip_id = p_trip_id AND tc.user_id = auth.uid())
    )
$$;

-- Minimal public-safe profile fields for multiple users (for e.g. reviews)
CREATE OR REPLACE FUNCTION public.get_users_public_profile_min(p_user_ids uuid[])
RETURNS TABLE (id uuid, full_name text, avatar_url text)
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT pr.id, pr.full_name, pr.avatar_url
  FROM public.profiles pr
  WHERE pr.id = ANY(p_user_ids)
$$;

-- Restrict execution of functions to authenticated users only
REVOKE ALL ON FUNCTION public.get_trip_user_profile(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_users_public_profile_min(uuid[]) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_trip_user_profile(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_users_public_profile_min(uuid[]) TO authenticated;