-- Function to handle complete user data deletion in cascade
CREATE OR REPLACE FUNCTION public.handle_user_deletion()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_trips uuid[];
  trip_record uuid;
BEGIN
  -- Store user's trip IDs for cleaning up related data
  SELECT array_agg(id) INTO user_trips
  FROM public.trips 
  WHERE user_id = OLD.id;

  -- Delete in dependency order to avoid foreign key violations
  
  -- 1. Delete trip decision votes for decisions in user's trips
  IF user_trips IS NOT NULL THEN
    DELETE FROM public.trip_decision_votes 
    WHERE decision_id IN (
      SELECT td.id FROM public.trip_decisions td 
      WHERE td.trip_id = ANY(user_trips)
    );
  END IF;

  -- 2. Delete trip decisions and expenses from user's trips
  IF user_trips IS NOT NULL THEN
    DELETE FROM public.trip_decisions WHERE trip_id = ANY(user_trips);
    DELETE FROM public.trip_expenses WHERE trip_id = ANY(user_trips);
  END IF;

  -- 3. Delete trip collaborators, members, and access logs
  IF user_trips IS NOT NULL THEN
    DELETE FROM public.trip_collaborators WHERE trip_id = ANY(user_trips) OR user_id = OLD.id;
    DELETE FROM public.trip_members WHERE trip_id = ANY(user_trips) OR user_id = OLD.id;
    DELETE FROM public.trip_access_log WHERE trip_id = ANY(user_trips) OR user_id = OLD.id;
  END IF;

  -- 4. Delete saved places and coordinates from user's trips
  IF user_trips IS NOT NULL THEN
    DELETE FROM public.saved_places WHERE trip_id = ANY(user_trips);
    DELETE FROM public.trip_coordinates WHERE trip_id = ANY(user_trips);
  END IF;

  -- 5. Delete user's direct data
  DELETE FROM public.ai_itineraries WHERE user_id = OLD.id;
  DELETE FROM public.place_reviews WHERE user_id = OLD.id;
  DELETE FROM public.user_achievement_progress WHERE user_id = OLD.id;
  DELETE FROM public.user_achievements WHERE user_id = OLD.id;
  DELETE FROM public.user_activities WHERE user_id = OLD.id;
  DELETE FROM public.user_stats WHERE user_id = OLD.id;

  -- 6. Delete trip invitations (sent by user or to user's email)
  DELETE FROM public.trip_invitations 
  WHERE inviter_id = OLD.id 
     OR email = (SELECT email FROM public.profiles WHERE id = OLD.id);

  -- 7. Delete user's trips
  DELETE FROM public.trips WHERE user_id = OLD.id;

  -- 8. Finally, delete user profile
  DELETE FROM public.profiles WHERE id = OLD.id;

  RETURN OLD;
END;
$$;

-- Create trigger to automatically handle user deletion
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  BEFORE DELETE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_deletion();