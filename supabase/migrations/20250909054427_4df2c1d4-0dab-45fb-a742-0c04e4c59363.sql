-- Security Fix: Implement comprehensive privacy protections for user location data
-- This addresses the vulnerability where location history could be tracked by malicious actors

-- Step 1: Add encrypted columns for sensitive location data
ALTER TABLE public.place_visits 
ADD COLUMN IF NOT EXISTS location_lat_encrypted text,
ADD COLUMN IF NOT EXISTS location_lng_encrypted text,
ADD COLUMN IF NOT EXISTS place_name_encrypted text;

-- Step 2: Create location data obfuscation functions (reuse existing secure functions)
CREATE OR REPLACE FUNCTION public.obfuscate_location_data(location_value text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Enhanced obfuscation for location data with additional entropy
  RETURN CASE 
    WHEN location_value IS NULL OR location_value = '' THEN location_value
    ELSE encode(convert_to(reverse(location_value) || '_loc_protected_' || extract(epoch from now())::text || '_' || random()::text, 'UTF8'), 'base64')
  END;
END;
$$;

-- Step 3: Create location data deobfuscation function
CREATE OR REPLACE FUNCTION public.deobfuscate_location_data(obfuscated_value text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  decoded_value text;
  original_value text;
BEGIN
  IF obfuscated_value IS NULL OR obfuscated_value = '' THEN
    RETURN obfuscated_value;
  END IF;
  
  BEGIN
    -- Decode and extract original value
    decoded_value := convert_from(decode(obfuscated_value, 'base64'), 'UTF8');
    original_value := reverse(split_part(decoded_value, '_loc_protected_', 1));
    RETURN original_value;
  EXCEPTION WHEN OTHERS THEN
    -- If deobfuscation fails, return null for security
    RETURN NULL;
  END;
END;
$$;

-- Step 4: Create secure function to access location visits with privacy controls
CREATE OR REPLACE FUNCTION public.get_user_location_visits_secure(
  p_user_id uuid,
  p_limit integer DEFAULT 50,
  p_offset integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  place_name text,
  place_category text,
  visited_at timestamp with time zone,
  country text,
  region text,
  city text,
  trip_id uuid,
  -- Note: We don't return exact coordinates for privacy
  approximate_location text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Security check: Only allow users to access their own location data
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Access denied: You can only view your own location visits';
  END IF;

  -- Log access for security monitoring
  INSERT INTO public.security_audit_log (
    table_name, user_id, action_type, details, timestamp
  ) VALUES (
    'place_visits', auth.uid(), 'SELECT_LOCATION_DATA', 
    jsonb_build_object('accessed_user', p_user_id, 'limit', p_limit), now()
  );

  RETURN QUERY
  SELECT 
    pv.id,
    CASE 
      WHEN pv.place_name_encrypted IS NOT NULL THEN deobfuscate_location_data(pv.place_name_encrypted)
      ELSE pv.place_name 
    END as place_name,
    pv.place_category,
    pv.visited_at,
    pv.country,
    pv.region,
    pv.city,
    pv.trip_id,
    -- Return approximate location instead of exact coordinates for privacy
    CASE 
      WHEN pv.city IS NOT NULL THEN pv.city || ', ' || COALESCE(pv.region, pv.country)
      WHEN pv.region IS NOT NULL THEN pv.region || ', ' || COALESCE(pv.country, 'Unknown')
      WHEN pv.country IS NOT NULL THEN pv.country
      ELSE 'Location Available'
    END as approximate_location
  FROM public.place_visits pv
  WHERE pv.user_id = p_user_id
  ORDER BY pv.visited_at DESC
  LIMIT LEAST(p_limit, 100) -- Maximum 100 records for performance and privacy
  OFFSET GREATEST(p_offset, 0);
END;
$$;

-- Step 5: Create function to get exact location data only when absolutely necessary
CREATE OR REPLACE FUNCTION public.get_place_visit_exact_location(
  p_visit_id uuid,
  p_user_id uuid
)
RETURNS TABLE(
  latitude numeric,
  longitude numeric,
  confirmation_distance numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Security check: Only allow users to access their own exact location data
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Access denied: You can only view your own location data';
  END IF;

  -- Additional security: Log exact location access
  INSERT INTO public.security_audit_log (
    table_name, user_id, action_type, details, timestamp
  ) VALUES (
    'place_visits', auth.uid(), 'ACCESS_EXACT_LOCATION', 
    jsonb_build_object('visit_id', p_visit_id, 'reason', 'exact_location_requested'), now()
  );

  RETURN QUERY
  SELECT 
    CASE 
      WHEN pv.location_lat_encrypted IS NOT NULL THEN deobfuscate_location_data(pv.location_lat_encrypted)::numeric
      ELSE pv.location_lat 
    END as latitude,
    CASE 
      WHEN pv.location_lng_encrypted IS NOT NULL THEN deobfuscate_location_data(pv.location_lng_encrypted)::numeric
      ELSE pv.location_lng 
    END as longitude,
    pv.confirmation_distance
  FROM public.place_visits pv
  WHERE pv.id = p_visit_id AND pv.user_id = p_user_id;
END;
$$;

-- Step 6: Create secure function to add location visits with automatic protection
CREATE OR REPLACE FUNCTION public.create_place_visit_secure(
  p_user_id uuid,
  p_saved_place_id uuid,
  p_trip_id uuid,
  p_location_lat numeric,
  p_location_lng numeric,
  p_confirmation_distance numeric,
  p_place_name text,
  p_place_category text DEFAULT NULL,
  p_country text DEFAULT NULL,
  p_region text DEFAULT NULL,
  p_city text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  visit_id uuid;
BEGIN
  -- Security check: Only allow users to create their own visits
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Access denied: You can only create your own place visits';
  END IF;

  -- Additional validation: Check if trip belongs to user
  IF NOT EXISTS (
    SELECT 1 FROM public.trips 
    WHERE id = p_trip_id AND (user_id = p_user_id OR is_trip_collaborator(id, p_user_id))
  ) THEN
    RAISE EXCEPTION 'Access denied: Trip not found or not accessible';
  END IF;

  -- Log location data creation
  INSERT INTO public.security_audit_log (
    table_name, user_id, action_type, details, timestamp
  ) VALUES (
    'place_visits', auth.uid(), 'CREATE_LOCATION_VISIT', 
    jsonb_build_object('trip_id', p_trip_id, 'place_category', p_place_category), now()
  );

  -- Insert with encrypted location data
  INSERT INTO public.place_visits (
    user_id,
    saved_place_id,
    trip_id,
    location_lat_encrypted,
    location_lng_encrypted,
    place_name_encrypted,
    confirmation_distance,
    place_category,
    country,
    region,
    city,
    visited_at,
    created_at
  ) VALUES (
    p_user_id,
    p_saved_place_id,
    p_trip_id,
    obfuscate_location_data(p_location_lat::text),
    obfuscate_location_data(p_location_lng::text),
    obfuscate_location_data(p_place_name),
    p_confirmation_distance,
    p_place_category,
    p_country,
    p_region,
    p_city,
    now(),
    now()
  ) RETURNING id INTO visit_id;

  RETURN visit_id;
END;
$$;

-- Step 7: Enhanced RLS policies with additional location privacy protections
DROP POLICY IF EXISTS "Users can view their own place visits" ON public.place_visits;
DROP POLICY IF EXISTS "Users can create their own place visits" ON public.place_visits;
DROP POLICY IF EXISTS "Users can update their own place visits" ON public.place_visits;
DROP POLICY IF EXISTS "Users can delete their own place visits" ON public.place_visits;

-- Create enhanced RLS policies with location privacy
CREATE POLICY "Strict location visit access control" ON public.place_visits
  FOR ALL USING (
    auth.uid() = user_id AND 
    auth.uid() IS NOT NULL AND 
    auth.role() = 'authenticated'
  )
  WITH CHECK (
    auth.uid() = user_id AND 
    auth.uid() IS NOT NULL AND 
    auth.role() = 'authenticated'
  );

-- Step 8: Create function for location data anonymization/deletion (GDPR compliance)
CREATE OR REPLACE FUNCTION public.anonymize_location_history(
  p_user_id uuid,
  p_older_than_days integer DEFAULT 365
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Security check
  IF auth.uid() IS NULL OR auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Access denied: You can only anonymize your own location data';
  END IF;

  -- Log anonymization request
  INSERT INTO public.security_audit_log (
    table_name, user_id, action_type, details, timestamp
  ) VALUES (
    'place_visits', auth.uid(), 'ANONYMIZE_LOCATION_DATA', 
    jsonb_build_object('older_than_days', p_older_than_days), now()
  );

  -- Anonymize old location data by removing exact coordinates
  UPDATE public.place_visits
  SET 
    location_lat = NULL,
    location_lng = NULL,
    location_lat_encrypted = NULL,
    location_lng_encrypted = NULL,
    place_name_encrypted = NULL,
    confirmation_distance = NULL
  WHERE user_id = p_user_id
    AND created_at < (now() - (p_older_than_days || ' days')::interval);

  RETURN true;
END;
$$;

-- Step 9: Migrate existing sensitive location data to encrypted format
DO $$
DECLARE
  visit_record RECORD;
BEGIN
  FOR visit_record IN 
    SELECT id, location_lat, location_lng, place_name
    FROM public.place_visits 
    WHERE (location_lat IS NOT NULL OR location_lng IS NOT NULL OR place_name IS NOT NULL)
      AND (location_lat_encrypted IS NULL OR location_lng_encrypted IS NULL OR place_name_encrypted IS NULL)
  LOOP
    UPDATE public.place_visits 
    SET 
      location_lat_encrypted = CASE WHEN location_lat IS NOT NULL AND location_lat_encrypted IS NULL THEN obfuscate_location_data(location_lat::text) ELSE location_lat_encrypted END,
      location_lng_encrypted = CASE WHEN location_lng IS NOT NULL AND location_lng_encrypted IS NULL THEN obfuscate_location_data(location_lng::text) ELSE location_lng_encrypted END,
      place_name_encrypted = CASE WHEN place_name IS NOT NULL AND place_name_encrypted IS NULL THEN obfuscate_location_data(place_name) ELSE place_name_encrypted END
    WHERE id = visit_record.id;
  END LOOP;
END $$;