-- Drop the complex policies that could have security gaps
DROP POLICY IF EXISTS "Users can view their own complete profile" ON public.profiles;
DROP POLICY IF EXISTS "Trip collaborators can view basic profile info" ON public.profiles;

-- Create simplified, secure policies
-- Policy 1: Users can ONLY view their own complete profile data
CREATE POLICY "Users can only view their own profile data" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Policy 2: Users can only update their own profile
CREATE POLICY "Users can only update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

-- Policy 3: Users can only insert their own profile
CREATE POLICY "Users can only insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Create a secure function that only returns safe profile data for collaboration
CREATE OR REPLACE FUNCTION public.get_collaborator_profile_safe(p_user_id uuid)
RETURNS TABLE(
  id uuid,
  full_name text,
  avatar_url text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
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
$$;

-- Create a function to check if two users are trip collaborators
CREATE OR REPLACE FUNCTION public.are_trip_collaborators(user1_id uuid, user2_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM trip_collaborators tc1
    JOIN trip_collaborators tc2 ON tc1.trip_id = tc2.trip_id
    WHERE tc1.user_id = user1_id 
    AND tc2.user_id = user2_id
  )
  OR EXISTS (
    SELECT 1 FROM trips t
    JOIN trip_collaborators tc ON tc.trip_id = t.id
    WHERE t.user_id = user1_id
    AND tc.user_id = user2_id
  )
  OR EXISTS (
    SELECT 1 FROM trips t
    JOIN trip_collaborators tc ON tc.trip_id = t.id
    WHERE t.user_id = user2_id
    AND tc.user_id = user1_id
  );
$$;

-- Create a function to get multiple collaborator profiles safely (for trip member lists)
CREATE OR REPLACE FUNCTION public.get_trip_collaborator_profiles(p_trip_id uuid)
RETURNS TABLE(
  id uuid,
  full_name text,
  avatar_url text,
  role text
)
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT pr.id, pr.full_name, pr.avatar_url, tc.role
  FROM public.profiles pr
  JOIN public.trip_collaborators tc ON tc.user_id = pr.id
  WHERE tc.trip_id = p_trip_id
  AND (
    -- Only return if user is the trip owner or a collaborator
    EXISTS (SELECT 1 FROM trips t WHERE t.id = p_trip_id AND t.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM trip_collaborators tc2 WHERE tc2.trip_id = p_trip_id AND tc2.user_id = auth.uid())
  );
$$;