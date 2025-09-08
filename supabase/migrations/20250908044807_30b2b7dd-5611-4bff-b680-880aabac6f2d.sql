-- Fix security issue: Restrict place_reviews access to authenticated users only
-- Remove the overly permissive "Enhanced review privacy" policy

DROP POLICY IF EXISTS "Enhanced review privacy" ON public.place_reviews;

-- Create a new more restrictive policy that only allows authenticated users to view reviews
-- This prevents data scraping and protects user privacy
CREATE POLICY "Authenticated users can view reviews" 
ON public.place_reviews 
FOR SELECT 
USING (
  auth.uid() IS NOT NULL 
  AND auth.role() = 'authenticated'
);

-- Update the get_place_reviews_public function to ensure it requires authentication
CREATE OR REPLACE FUNCTION public.get_place_reviews_public(
  p_place_id text, 
  p_place_name text, 
  p_lat numeric DEFAULT NULL::numeric, 
  p_lng numeric DEFAULT NULL::numeric, 
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
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
  -- Ensure only authenticated users can access reviews
  SELECT 
    CASE 
      WHEN auth.uid() IS NULL OR auth.role() != 'authenticated' THEN NULL::uuid
      ELSE pr.id
    END as id,
    CASE 
      WHEN auth.uid() IS NULL OR auth.role() != 'authenticated' THEN NULL::text
      ELSE pr.place_id
    END as place_id,
    CASE 
      WHEN auth.uid() IS NULL OR auth.role() != 'authenticated' THEN NULL::text
      ELSE pr.place_name
    END as place_name,
    CASE 
      WHEN auth.uid() IS NULL OR auth.role() != 'authenticated' THEN NULL::integer
      ELSE pr.rating
    END as rating,
    CASE 
      WHEN auth.uid() IS NULL OR auth.role() != 'authenticated' THEN NULL::text
      ELSE pr.comment
    END as comment,
    CASE 
      WHEN auth.uid() IS NULL OR auth.role() != 'authenticated' THEN NULL::timestamp with time zone
      ELSE pr.created_at
    END as created_at,
    CASE 
      WHEN auth.uid() IS NULL OR auth.role() != 'authenticated' THEN NULL::timestamp with time zone
      ELSE pr.updated_at
    END as updated_at,
    CASE 
      WHEN auth.uid() IS NULL OR auth.role() != 'authenticated' THEN NULL::boolean
      ELSE pr.anonymous
    END as anonymous,
    CASE 
      WHEN auth.uid() IS NULL OR auth.role() != 'authenticated' THEN NULL::uuid
      WHEN pr.anonymous THEN NULL::uuid
      ELSE pr.user_id
    END as user_id
  FROM public.place_reviews pr
  WHERE 
    auth.uid() IS NOT NULL 
    AND auth.role() = 'authenticated'
    AND (
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
      )
    )
  ORDER BY pr.created_at DESC
  OFFSET GREATEST(p_offset, 0)
  LIMIT LEAST(p_limit, 100);
$function$;

-- Update the count function to also require authentication
CREATE OR REPLACE FUNCTION public.get_place_reviews_count(
  p_place_id text, 
  p_place_name text, 
  p_lat numeric DEFAULT NULL::numeric, 
  p_lng numeric DEFAULT NULL::numeric
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  v_count integer;
BEGIN
  -- Return 0 if user is not authenticated
  IF auth.uid() IS NULL OR auth.role() != 'authenticated' THEN
    RETURN 0;
  END IF;

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
$function$;