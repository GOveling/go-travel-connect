-- Security Fix: Protect Customer Reviews from Competitor Scraping (Final)
-- This addresses the vulnerability where all authenticated users could access all reviews

-- Step 1: Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Authenticated users can view reviews" ON public.place_reviews;
DROP POLICY IF EXISTS "Users can view their own reviews" ON public.place_reviews;
DROP POLICY IF EXISTS "Users can create their own reviews" ON public.place_reviews;
DROP POLICY IF EXISTS "Users can update their own reviews" ON public.place_reviews;
DROP POLICY IF EXISTS "Users can delete their own reviews" ON public.place_reviews;
DROP POLICY IF EXISTS "Users can only view their own reviews directly" ON public.place_reviews;
DROP POLICY IF EXISTS "Users can only create their own reviews" ON public.place_reviews;
DROP POLICY IF EXISTS "Users can only update their own reviews" ON public.place_reviews;
DROP POLICY IF EXISTS "Users can only delete their own reviews" ON public.place_reviews;

-- Step 2: Create rate-limited, secure function for accessing place reviews
CREATE OR REPLACE FUNCTION public.get_place_reviews_secure(
  p_place_id text,
  p_place_name text,
  p_lat numeric DEFAULT NULL,
  p_lng numeric DEFAULT NULL,
  p_offset integer DEFAULT 0,
  p_limit integer DEFAULT 5
)
RETURNS TABLE(
  id uuid,
  rating integer,
  comment text,
  created_at timestamp with time zone,
  anonymous boolean,
  reviewer_display_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  access_count integer;
BEGIN
  -- Security check: Only allow authenticated users
  IF auth.uid() IS NULL OR auth.role() != 'authenticated' THEN
    RAISE EXCEPTION 'Authentication required to view reviews';
  END IF;

  -- Rate limiting: Check recent access from this user
  SELECT COUNT(*) INTO access_count
  FROM public.security_audit_log
  WHERE user_id = auth.uid()
    AND table_name = 'place_reviews'
    AND action_type = 'VIEW_PLACE_REVIEWS'
    AND timestamp > (now() - interval '1 hour');

  -- Allow maximum 20 review requests per hour per user
  IF access_count >= 20 THEN
    RAISE EXCEPTION 'Rate limit exceeded: Too many review requests in the last hour';
  END IF;

  -- Log the access for security monitoring
  INSERT INTO public.security_audit_log (
    table_name, user_id, action_type, details, timestamp
  ) VALUES (
    'place_reviews', auth.uid(), 'VIEW_PLACE_REVIEWS', 
    jsonb_build_object(
      'place_id', p_place_id,
      'place_name', p_place_name,
      'limit', p_limit,
      'offset', p_offset
    ), 
    now()
  );

  -- Return limited, anonymized review data
  RETURN QUERY
  SELECT 
    pr.id,
    pr.rating,
    -- Limit comment length and sanitize
    CASE 
      WHEN length(pr.comment) > 200 THEN left(pr.comment, 200) || '...'
      ELSE pr.comment
    END as comment,
    pr.created_at,
    COALESCE(pr.anonymous, false) as anonymous,
    -- Never expose real user information
    CASE 
      WHEN COALESCE(pr.anonymous, false) THEN 'Anonymous Traveler'
      ELSE 'Verified Traveler'
    END as reviewer_display_name
  FROM public.place_reviews pr
  WHERE 
    (
      (p_lat IS NOT NULL AND p_lng IS NOT NULL
        AND pr.lat BETWEEN p_lat - 0.0001 AND p_lat + 0.0001
        AND pr.lng BETWEEN p_lng - 0.0001 AND p_lng + 0.0001
        AND pr.place_name = p_place_name)
      OR
      (p_lat IS NULL OR p_lng IS NULL)
        AND pr.place_id = p_place_id
    )
  ORDER BY pr.created_at DESC
  LIMIT LEAST(p_limit, 10) -- Maximum 10 reviews per request
  OFFSET GREATEST(p_offset, 0);
END;
$$;

-- Step 3: Replace the old insecure function
DROP FUNCTION IF EXISTS public.get_place_reviews_public(text, text, numeric, numeric, integer, integer);

-- Create secure replacement function
CREATE OR REPLACE FUNCTION public.get_place_reviews_public(
  p_place_id text,
  p_place_name text,
  p_lat numeric DEFAULT NULL,
  p_lng numeric DEFAULT NULL,
  p_offset integer DEFAULT 0,
  p_limit integer DEFAULT 5
)
RETURNS TABLE(
  id uuid,
  place_id text,
  place_name text,
  rating integer,
  comment text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  anonymous boolean,
  user_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Redirect to the secure function but with limited data
  RETURN QUERY
  SELECT 
    sr.id,
    p_place_id as place_id,
    p_place_name as place_name,
    sr.rating,
    sr.comment,
    sr.created_at,
    sr.created_at as updated_at, -- Don't expose update times
    sr.anonymous,
    NULL::uuid as user_id -- Never expose user IDs
  FROM public.get_place_reviews_secure(
    p_place_id, p_place_name, p_lat, p_lng, p_offset, p_limit
  ) sr;
END;
$$;

-- Step 4: Create new enhanced RLS policies that prevent bulk access
CREATE POLICY "Secure review access - own reviews only" ON public.place_reviews
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Secure review creation" ON public.place_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Secure review updates" ON public.place_reviews
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Secure review deletion" ON public.place_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Step 5: Update the count function to be more secure
CREATE OR REPLACE FUNCTION public.get_place_reviews_count(
  p_place_id text, 
  p_place_name text, 
  p_lat numeric DEFAULT NULL, 
  p_lng numeric DEFAULT NULL
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_count integer;
  access_count integer;
BEGIN
  -- Security check
  IF auth.uid() IS NULL OR auth.role() != 'authenticated' THEN
    RETURN 0;
  END IF;

  -- Rate limiting for count requests
  SELECT COUNT(*) INTO access_count
  FROM public.security_audit_log
  WHERE user_id = auth.uid()
    AND table_name = 'place_reviews'
    AND action_type = 'COUNT_REVIEWS'
    AND timestamp > (now() - interval '1 hour');

  IF access_count >= 30 THEN
    RAISE EXCEPTION 'Rate limit exceeded: Too many count requests';
  END IF;

  -- Log the access
  INSERT INTO public.security_audit_log (
    table_name, user_id, action_type, details, timestamp
  ) VALUES (
    'place_reviews', auth.uid(), 'COUNT_REVIEWS', 
    jsonb_build_object('place_id', p_place_id), now()
  );

  SELECT COUNT(*) INTO v_count
  FROM public.place_reviews pr
  WHERE
    (
      p_lat IS NOT NULL AND p_lng IS NOT NULL
      AND pr.lat BETWEEN p_lat - 0.0001 AND p_lat + 0.0001
      AND pr.lng BETWEEN p_lng - 0.0001 AND p_lng + 0.0001
      AND pr.place_name = p_place_name
    )
    OR
    (
      (p_lat IS NULL OR p_lng IS NULL)
      AND pr.place_id = p_place_id
    );
    
  RETURN v_count;
END;
$$;