-- Fix search_path for all functions to prevent path hijacking vulnerabilities
-- This sets search_path to 'public' for all custom functions

-- Update extract_country_from_destination function
CREATE OR REPLACE FUNCTION public.extract_country_from_destination(destination_name text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF destination_name IS NULL OR destination_name = '' THEN
    RETURN 'Unknown';
  END IF;
  
  -- Extract country (last part after comma, or whole string if no comma)
  IF position(',' in destination_name) > 0 THEN
    RETURN trim(split_part(destination_name, ',', -1));
  ELSE
    RETURN trim(destination_name);
  END IF;
END;
$function$;

-- Update update_trip_destination_countries function
CREATE OR REPLACE FUNCTION public.update_trip_destination_countries()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  countries_array jsonb;
BEGIN
  -- Get unique countries from all saved places for this trip
  SELECT jsonb_agg(DISTINCT extract_country_from_destination(destination_name))
  INTO countries_array
  FROM saved_places 
  WHERE trip_id = COALESCE(NEW.trip_id, OLD.trip_id)
  AND destination_name IS NOT NULL;
  
  -- If no countries found, set empty array
  IF countries_array IS NULL THEN
    countries_array = '[]'::jsonb;
  END IF;
  
  -- Update the trip's destination column
  UPDATE trips 
  SET destination = countries_array,
      updated_at = now()
  WHERE id = COALESCE(NEW.trip_id, OLD.trip_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Update update_updated_at_column function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update auto_assign_position function
CREATE OR REPLACE FUNCTION public.auto_assign_position()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- If position_order is not set, assign the next available position
  IF NEW.position_order IS NULL OR NEW.position_order = 0 THEN
    SELECT COALESCE(MAX(position_order), 0) + 1
    INTO NEW.position_order
    FROM public.saved_places
    WHERE trip_id = NEW.trip_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update reorder_saved_places_positions function
CREATE OR REPLACE FUNCTION public.reorder_saved_places_positions()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Reorder positions for the affected trip
  UPDATE public.saved_places 
  SET position_order = subquery.new_position
  FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY position_order, created_at) as new_position
    FROM public.saved_places 
    WHERE trip_id = OLD.trip_id
  ) AS subquery
  WHERE saved_places.id = subquery.id;
  
  RETURN OLD;
END;
$function$;

-- Update enforce_profile_security function
CREATE OR REPLACE FUNCTION public.enforce_profile_security()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Ensure the profile ID always matches the authenticated user
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.id != auth.uid() THEN
      RAISE EXCEPTION 'Access denied: Cannot modify profile for different user';
    END IF;
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$function$;

-- Update update_trip_group_status function
CREATE OR REPLACE FUNCTION public.update_trip_group_status()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    -- Update the trip when collaborator is added/updated
    UPDATE public.trips
    SET 
      collaborators_count = (
        SELECT COUNT(*) FROM public.trip_collaborators 
        WHERE trip_id = NEW.trip_id
      ),
      is_group_trip = true,
      updated_at = now()
    WHERE id = NEW.trip_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Update the trip when collaborator is removed
    UPDATE public.trips
    SET 
      collaborators_count = (
        SELECT COUNT(*) FROM public.trip_collaborators 
        WHERE trip_id = OLD.trip_id
      ),
      is_group_trip = CASE 
        WHEN (SELECT COUNT(*) FROM public.trip_collaborators WHERE trip_id = OLD.trip_id) > 0 THEN true
        ELSE false
      END,
      updated_at = now()
    WHERE id = OLD.trip_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

-- Update log_document_access function
CREATE OR REPLACE FUNCTION public.log_document_access()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.document_access_log (
    user_id, document_id, action_type, access_timestamp
  ) VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    COALESCE(NEW.id, OLD.id),
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'create'
      WHEN TG_OP = 'UPDATE' THEN 'update'
      WHEN TG_OP = 'DELETE' THEN 'delete'
      ELSE 'read'
    END,
    now()
  );
  
  -- Update access count for reads
  IF TG_OP = 'UPDATE' AND OLD.access_count IS DISTINCT FROM NEW.access_count THEN
    UPDATE public.encrypted_travel_documents 
    SET last_accessed_at = now()
    WHERE id = NEW.id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Update update_user_stats_on_visit function
CREATE OR REPLACE FUNCTION public.update_user_stats_on_visit()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  place_category text;
  place_country text;
  place_city text;
BEGIN
  -- Get place details
  SELECT category, country, city INTO place_category, place_country, place_city
  FROM saved_places WHERE id = NEW.saved_place_id;
  
  -- Update general stats
  UPDATE user_stats 
  SET places_visited = places_visited + 1,
      updated_at = now()
  WHERE user_id = NEW.user_id;
  
  -- Update category-specific stats
  IF place_category IS NOT NULL THEN
    CASE lower(place_category)
      WHEN 'restaurant' THEN
        UPDATE user_stats SET restaurants_visited = restaurants_visited + 1 WHERE user_id = NEW.user_id;
      WHEN 'museum' THEN
        UPDATE user_stats SET museums_visited = museums_visited + 1 WHERE user_id = NEW.user_id;
      WHEN 'tourist_attraction' THEN
        UPDATE user_stats SET attractions_visited = attractions_visited + 1 WHERE user_id = NEW.user_id;
      WHEN 'lodging' THEN
        UPDATE user_stats SET hotels_visited = hotels_visited + 1 WHERE user_id = NEW.user_id;
      WHEN 'park' THEN
        UPDATE user_stats SET parks_visited = parks_visited + 1 WHERE user_id = NEW.user_id;
      WHEN 'store' THEN
        UPDATE user_stats SET shops_visited = shops_visited + 1 WHERE user_id = NEW.user_id;
      WHEN 'establishment' THEN
        UPDATE user_stats SET landmarks_visited = landmarks_visited + 1 WHERE user_id = NEW.user_id;
      ELSE
        UPDATE user_stats SET other_places_visited = other_places_visited + 1 WHERE user_id = NEW.user_id;
    END CASE;
  END IF;
  
  -- Check for country/city achievements
  IF place_country IS NOT NULL THEN
    -- Count unique countries visited
    UPDATE user_stats 
    SET countries_visited = (
      SELECT COUNT(DISTINCT country) 
      FROM place_visits 
      WHERE user_id = NEW.user_id AND country IS NOT NULL
    )
    WHERE user_id = NEW.user_id;
  END IF;
  
  IF place_city IS NOT NULL THEN
    -- Count unique cities visited
    UPDATE user_stats 
    SET cities_explored = (
      SELECT COUNT(DISTINCT city) 
      FROM place_visits 
      WHERE user_id = NEW.user_id AND city IS NOT NULL
    )
    WHERE user_id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Insert new user profile with better error handling
  INSERT INTO public.profiles (id, email, full_name, created_at, updated_at)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(
      NEW.raw_user_meta_data->>'full_name', 
      NEW.raw_user_meta_data->>'name', 
      ''
    ),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
    updated_at = NOW();
  
  -- Initialize user stats with error handling
  INSERT INTO public.user_stats (user_id, created_at, updated_at)
  VALUES (NEW.id, NOW(), NOW())
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Log the error but don't block user creation
  RAISE LOG 'Error in handle_new_user for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$function$;

-- Update calculate_age function
CREATE OR REPLACE FUNCTION public.calculate_age(birth_date date)
 RETURNS integer
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF birth_date IS NULL THEN
    RETURN NULL;
  END IF;
  
  RETURN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date));
END;
$function$;

-- Update update_age_on_birth_date_change function
CREATE OR REPLACE FUNCTION public.update_age_on_birth_date_change()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Only calculate age if birth_date is actually being updated and is not null
  IF TG_OP = 'UPDATE' AND OLD.birth_date IS DISTINCT FROM NEW.birth_date AND NEW.birth_date IS NOT NULL THEN
    NEW.age = calculate_age(NEW.birth_date);
  END IF;
  RETURN NEW;
END;
$function$;

-- Update update_collaborators_count function
CREATE OR REPLACE FUNCTION public.update_collaborators_count()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.trips
    SET 
      collaborators_count = (
        SELECT COUNT(*) FROM public.trip_collaborators 
        WHERE trip_id = NEW.trip_id
      ),
      is_group_trip = true,
      updated_at = now()
    WHERE id = NEW.trip_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.trips
    SET 
      collaborators_count = (
        SELECT COUNT(*) FROM public.trip_collaborators 
        WHERE trip_id = OLD.trip_id
      ),
      updated_at = now()
    WHERE id = OLD.trip_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$function$;

-- Update obfuscate_sensitive_field function
CREATE OR REPLACE FUNCTION public.obfuscate_sensitive_field(field_value text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Simple obfuscation using encode and some transformations
  RETURN CASE 
    WHEN field_value IS NULL OR field_value = '' THEN field_value
    ELSE encode(convert_to(reverse(field_value) || '_protected_' || extract(epoch from now())::text, 'UTF8'), 'base64')
  END;
END;
$function$;

-- Update encrypt_sensitive_field function
CREATE OR REPLACE FUNCTION public.encrypt_sensitive_field(field_value text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Use pgcrypto extension for encryption
  RETURN CASE 
    WHEN field_value IS NULL OR field_value = '' THEN field_value
    ELSE encode(encrypt(field_value::bytea, 'encryption_key', 'aes'), 'base64')
  END;
END;
$function$;

-- Update deobfuscate_sensitive_field function
CREATE OR REPLACE FUNCTION public.deobfuscate_sensitive_field(obfuscated_value text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    original_value := reverse(split_part(decoded_value, '_protected_', 1));
    RETURN original_value;
  EXCEPTION WHEN OTHERS THEN
    -- If deobfuscation fails, return the original value (might be unobfuscated)
    RETURN obfuscated_value;
  END;
END;
$function$;

-- Update decrypt_sensitive_field function
CREATE OR REPLACE FUNCTION public.decrypt_sensitive_field(encrypted_value text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN CASE 
    WHEN encrypted_value IS NULL OR encrypted_value = '' THEN encrypted_value
    ELSE convert_from(decrypt(decode(encrypted_value, 'base64'), 'encryption_key', 'aes'), 'UTF8')
  END;
END;
$function$;

-- Update cleanup_old_audit_logs function
CREATE OR REPLACE FUNCTION public.cleanup_old_audit_logs()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Delete audit logs older than 90 days
  DELETE FROM public.security_audit_log 
  WHERE timestamp < NOW() - INTERVAL '90 days';
END;
$function$;

-- Update cleanup_expired_shared_locations function
CREATE OR REPLACE FUNCTION public.cleanup_expired_shared_locations()
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM public.trip_shared_locations 
  WHERE expires_at < now();
END;
$function$;

-- Update handle_user_deletion function
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_trips uuid[];
BEGIN
  SELECT array_agg(id) INTO user_trips FROM trips WHERE user_id = OLD.id;

  IF user_trips IS NOT NULL THEN
    DELETE FROM trip_decision_votes WHERE decision_id IN (
      SELECT td.id FROM trip_decisions td WHERE td.trip_id = ANY(user_trips)
    );
    DELETE FROM trip_decisions WHERE trip_id = ANY(user_trips);
    DELETE FROM trip_expenses WHERE trip_id = ANY(user_trips);
    DELETE FROM trip_collaborators WHERE trip_id = ANY(user_trips) OR user_id = OLD.id;
    DELETE FROM trip_members WHERE trip_id = ANY(user_trips) OR user_id = OLD.id;
    DELETE FROM trip_access_log WHERE trip_id = ANY(user_trips) OR user_id = OLD.id;
    DELETE FROM saved_places WHERE trip_id = ANY(user_trips);
    DELETE FROM trip_coordinates WHERE trip_id = ANY(user_trips);
  END IF;

  DELETE FROM ai_itineraries WHERE user_id = OLD.id;
  DELETE FROM place_reviews WHERE user_id = OLD.id;
  DELETE FROM user_achievement_progress WHERE user_id = OLD.id;
  DELETE FROM user_achievements WHERE user_id = OLD.id;
  DELETE FROM user_activities WHERE user_id = OLD.id;
  DELETE FROM user_stats WHERE user_id = OLD.id;

  DELETE FROM trip_invitations 
  WHERE inviter_id = OLD.id 
     OR email = (SELECT email FROM profiles WHERE id = OLD.id);

  DELETE FROM trips WHERE user_id = OLD.id;
  DELETE FROM profiles WHERE id = OLD.id;
  RETURN OLD;
END;
$function$;

-- Update notify_saved_place_changes function
CREATE OR REPLACE FUNCTION public.notify_saved_place_changes()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  trip_is_group boolean;
  actor_user_id uuid;
BEGIN
  -- Check if trip is a group trip
  SELECT is_group_trip INTO trip_is_group 
  FROM trips 
  WHERE id = COALESCE(NEW.trip_id, OLD.trip_id);
  
  IF NOT trip_is_group THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Get the actor (authenticated user)
  actor_user_id := auth.uid();
  IF actor_user_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF TG_OP = 'INSERT' THEN
    PERFORM notify_trip_members(
      NEW.trip_id,
      actor_user_id,
      'place_added',
      'New place added',
      'added "' || NEW.name || '" to the trip',
      NEW.id,
      'MapPin',
      'text-green-600'
    );
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM notify_trip_members(
      NEW.trip_id,
      actor_user_id,
      'place_updated',
      'Place updated',
      'updated "' || NEW.name || '"',
      NEW.id,
      'MapPin',
      'text-blue-600'
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- Update update_trip_members_updated_at function
CREATE OR REPLACE FUNCTION public.update_trip_members_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

-- Update validate_profile_email function
CREATE OR REPLACE FUNCTION public.validate_profile_email()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  auth_email text;
BEGIN
  -- Get the authenticated user's email from auth.users
  SELECT email INTO auth_email FROM auth.users WHERE id = auth.uid();
  
  -- If email is being set and doesn't match auth email, log a warning
  IF NEW.email IS NOT NULL AND NEW.email != auth_email THEN
    RAISE WARNING 'Profile email % does not match auth email %', NEW.email, auth_email;
  END IF;
  
  RETURN NEW;
END;
$function$;