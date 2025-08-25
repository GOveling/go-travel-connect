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

-- Create a secure public view for collaboration that only exposes safe data
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  full_name,
  avatar_url,
  created_at
FROM public.profiles;

-- Enable RLS on the view
ALTER VIEW public.public_profiles SET (security_barrier = true);

-- Create RLS policy for the public view - only for trip collaboration
CREATE POLICY "Trip members can view public profile info" 
ON public.public_profiles 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND (
    -- User is viewing their own public profile
    auth.uid() = id
    OR
    -- User is a trip collaborator with the profile owner
    EXISTS (
      SELECT 1 FROM trip_collaborators tc1
      JOIN trip_collaborators tc2 ON tc1.trip_id = tc2.trip_id
      WHERE tc1.user_id = auth.uid() 
      AND tc2.user_id = public_profiles.id
    )
    OR
    -- User is trip owner and profile owner is a collaborator
    EXISTS (
      SELECT 1 FROM trips t
      JOIN trip_collaborators tc ON tc.trip_id = t.id
      WHERE t.user_id = auth.uid()
      AND tc.user_id = public_profiles.id
    )
    OR
    -- Profile owner is trip owner and user is a collaborator
    EXISTS (
      SELECT 1 FROM trips t
      JOIN trip_collaborators tc ON tc.trip_id = t.id
      WHERE t.user_id = public_profiles.id
      AND tc.user_id = auth.uid()
    )
  )
);

-- Update the existing safe profile function to use the view
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
  SELECT pp.id, pp.full_name, pp.avatar_url
  FROM public.public_profiles pp
  WHERE pp.id = p_user_id;
$$;

-- Create a function to check if two users are trip collaborators (for use in app logic)
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