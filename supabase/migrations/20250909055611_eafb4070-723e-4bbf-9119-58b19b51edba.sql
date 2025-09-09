-- Complete the security fix for customer reviews - Functions only
-- The RLS policies were already created in the previous migration

-- Remove the problematic policy that allows all authenticated users to create reviews
DROP POLICY IF EXISTS "Authenticated users can create reviews" ON public.place_reviews;

-- Create the remaining functions that are needed for the security fix

-- Function for review statistics without exposing individual reviews
CREATE OR REPLACE FUNCTION public.get_place_review_stats(
  p_place_id text,
  p_place_name text,
  p_lat numeric DEFAULT NULL,
  p_lng numeric DEFAULT NULL
)
RETURNS TABLE(
  total_reviews integer,
  average_rating numeric,
  rating_distribution jsonb
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
    RAISE EXCEPTION 'Authentication required to view review statistics';
  END IF;

  -- Rate limiting for stats requests
  SELECT COUNT(*) INTO access_count
  FROM public.security_audit_log
  WHERE user_id = auth.uid()
    AND table_name = 'place_reviews'
    AND action_type = 'VIEW_REVIEW_STATS'
    AND timestamp > (now() - interval '1 hour');

  -- Allow maximum 50 stats requests per hour per user
  IF access_count >= 50 THEN
    RAISE EXCEPTION 'Rate limit exceeded: Too many stats requests in the last hour';
  END IF;

  -- Log the access
  INSERT INTO public.security_audit_log (
    table_name, user_id, action_type, details, timestamp
  ) VALUES (
    'place_reviews', auth.uid(), 'VIEW_REVIEW_STATS', 
    jsonb_build_object('place_id', p_place_id, 'place_name', p_place_name), 
    now()
  );

  -- Return aggregated statistics only
  RETURN QUERY
  SELECT 
    COUNT(*)::integer as total_reviews,
    ROUND(AVG(pr.rating), 1) as average_rating,
    jsonb_object_agg(
      pr.rating::text, 
      COUNT(*)
    ) as rating_distribution
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
    );
END;
$$;

-- Function to detect bulk review access patterns  
CREATE OR REPLACE FUNCTION public.monitor_review_access_patterns()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  suspicious_users RECORD;
BEGIN
  -- Check for users with suspicious review access patterns in the last hour
  FOR suspicious_users IN
    SELECT 
      user_id,
      COUNT(*) as request_count,
      COUNT(DISTINCT (details->>'place_id')) as unique_places,
      array_agg(DISTINCT (details->>'place_id')) as accessed_places
    FROM public.security_audit_log
    WHERE table_name = 'place_reviews'
      AND action_type IN ('VIEW_PLACE_REVIEWS', 'COUNT_REVIEWS')
      AND timestamp > (now() - interval '1 hour')
    GROUP BY user_id
    HAVING COUNT(*) > 30 OR COUNT(DISTINCT (details->>'place_id')) > 15
  LOOP
    -- Log suspicious activity
    INSERT INTO public.security_audit_log (
      table_name, user_id, action_type, details, timestamp
    ) VALUES (
      'place_reviews', 
      suspicious_users.user_id, 
      'BULK_REVIEW_ACCESS_DETECTED', 
      jsonb_build_object(
        'request_count', suspicious_users.request_count,
        'unique_places', suspicious_users.unique_places,
        'severity', 'high',
        'recommendation', 'investigate_for_scraping'
      ), 
      now()
    );
  END LOOP;
END;
$$;