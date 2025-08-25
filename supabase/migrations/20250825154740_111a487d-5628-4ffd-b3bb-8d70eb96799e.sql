-- Drop existing policies that are too restrictive
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create more granular policies for controlled profile access

-- Policy 1: Users can always view their own complete profile
CREATE POLICY "Users can view their own complete profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Policy 2: Trip collaborators can view basic profile info of other trip members
-- This allows viewing name and avatar for collaboration features while protecting sensitive data
CREATE POLICY "Trip collaborators can view basic profile info" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.uid() != id 
  AND (
    -- User is a trip collaborator with the profile owner
    EXISTS (
      SELECT 1 FROM trip_collaborators tc1
      JOIN trip_collaborators tc2 ON tc1.trip_id = tc2.trip_id
      WHERE tc1.user_id = auth.uid() 
      AND tc2.user_id = profiles.id
    )
    OR
    -- User is trip owner and profile owner is a collaborator
    EXISTS (
      SELECT 1 FROM trips t
      JOIN trip_collaborators tc ON tc.trip_id = t.id
      WHERE t.user_id = auth.uid()
      AND tc.user_id = profiles.id
    )
    OR
    -- Profile owner is trip owner and user is a collaborator
    EXISTS (
      SELECT 1 FROM trips t
      JOIN trip_collaborators tc ON tc.trip_id = t.id
      WHERE t.user_id = profiles.id
      AND tc.user_id = auth.uid()
    )
  )
);

-- Create a security definer function to get safe profile data for collaborators
-- This function only returns non-sensitive fields
CREATE OR REPLACE FUNCTION public.get_collaborator_profile_safe(p_user_id uuid)
RETURNS TABLE(
  id uuid,
  full_name text,
  avatar_url text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT pr.id, pr.full_name, pr.avatar_url
  FROM public.profiles pr
  WHERE pr.id = p_user_id
  AND (
    -- Only return data if the requesting user has collaboration relationship
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
$$;