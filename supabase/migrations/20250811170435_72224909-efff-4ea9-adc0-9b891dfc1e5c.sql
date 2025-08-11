-- Restrict public read on place_reviews and add secure RPCs

-- 1) Remove public SELECT on place_reviews
DROP POLICY IF EXISTS "Anyone can view place reviews" ON public.place_reviews;

-- 2) Ensure users can still read their own reviews
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'place_reviews' AND policyname = 'Users can view their own reviews'
  ) THEN
    CREATE POLICY "Users can view their own reviews"
    ON public.place_reviews
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
END $$;

-- 3) Public (authenticated) read via SECURITY DEFINER RPC with anonymization
CREATE OR REPLACE FUNCTION public.get_place_reviews_public(
  p_place_id text,
  p_place_name text,
  p_lat numeric DEFAULT NULL,
  p_lng numeric DEFAULT NULL,
  p_offset integer DEFAULT 0,
  p_limit integer DEFAULT 5
)
RETURNS TABLE (
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
SET search_path TO 'public'
AS $$
  WITH filtered AS (
    SELECT *
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
      )
  )
  SELECT 
    id,
    place_id,
    place_name,
    rating,
    comment,
    created_at,
    updated_at,
    anonymous,
    CASE WHEN anonymous THEN NULL ELSE user_id END AS user_id
  FROM filtered
  ORDER BY created_at DESC
  OFFSET GREATEST(p_offset, 0)
  LIMIT LEAST(p_limit, 100)
$$;

-- 4) Matching count function
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
BEGIN
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

-- 5) Lock down function execution to authenticated users only
REVOKE ALL ON FUNCTION public.get_place_reviews_public(text, text, numeric, numeric, integer, integer) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_place_reviews_count(text, text, numeric, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_place_reviews_public(text, text, numeric, numeric, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_place_reviews_count(text, text, numeric, numeric) TO authenticated;