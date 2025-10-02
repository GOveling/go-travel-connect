-- Update notify_trip_members function to include trip name
CREATE OR REPLACE FUNCTION public.notify_trip_members(
  p_trip_id uuid, 
  p_actor_user_id uuid, 
  p_type text, 
  p_title text, 
  p_message text, 
  p_related_id uuid DEFAULT NULL::uuid, 
  p_icon text DEFAULT 'Bell'::text, 
  p_color text DEFAULT 'text-blue-600'::text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  actor_name text;
  trip_name text;
  enhanced_message text;
  member_record RECORD;
BEGIN
  -- Get actor name
  SELECT full_name INTO actor_name FROM profiles WHERE id = p_actor_user_id;
  IF actor_name IS NULL THEN
    actor_name := 'Someone';
  END IF;

  -- Get trip name
  SELECT name INTO trip_name FROM trips WHERE id = p_trip_id;
  IF trip_name IS NULL THEN
    trip_name := 'Unknown Trip';
  END IF;

  -- Enhance message to include trip name
  enhanced_message := p_message || ' to ' || trip_name;

  -- Insert notifications for all trip members except the actor
  -- Trip owner
  INSERT INTO general_notifications (
    user_id, trip_id, type, title, message, actor_user_id, actor_name, 
    related_id, icon, color
  )
  SELECT 
    t.user_id, p_trip_id, p_type, p_title, enhanced_message, p_actor_user_id, actor_name,
    p_related_id, p_icon, p_color
  FROM trips t
  WHERE t.id = p_trip_id 
    AND t.user_id != p_actor_user_id;

  -- Trip collaborators
  INSERT INTO general_notifications (
    user_id, trip_id, type, title, message, actor_user_id, actor_name, 
    related_id, icon, color
  )
  SELECT 
    tc.user_id, p_trip_id, p_type, p_title, enhanced_message, p_actor_user_id, actor_name,
    p_related_id, p_icon, p_color
  FROM trip_collaborators tc
  WHERE tc.trip_id = p_trip_id 
    AND tc.user_id != p_actor_user_id;
END;
$$;