-- Fix security issue: Achievement System Data Exposed to All Users
-- The get_user_achievements_with_progress function was allowing any user to query any other user's achievement data

-- Update the function to only allow users to query their own achievement data
CREATE OR REPLACE FUNCTION public.get_user_achievements_with_progress(p_user_id uuid)
 RETURNS TABLE(achievement_id text, title text, description text, category text, icon text, points integer, total_required integer, criteria text, rarity text, current_progress integer, is_completed boolean, completed_at timestamp with time zone, progress_percentage numeric)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Security check: Only allow users to query their own achievement data
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Access denied: You can only view your own achievement progress';
  END IF;

  RETURN QUERY
  SELECT 
    a.id,
    a.title,
    a.description,
    a.category,
    a.icon,
    a.points,
    a.total_required,
    a.criteria,
    a.rarity,
    COALESCE(uap.current_progress, 0) as current_progress,
    COALESCE(uap.is_completed, false) as is_completed,
    uap.completed_at,
    ROUND((COALESCE(uap.current_progress, 0)::NUMERIC / a.total_required::NUMERIC) * 100, 2) as progress_percentage
  FROM achievements a
  LEFT JOIN user_achievement_progress uap ON a.id = uap.achievement_id AND uap.user_id = p_user_id
  ORDER BY a.category, a.rarity, a.title;
END;
$function$;

-- Also update the update_achievement_progress function to ensure proper security
CREATE OR REPLACE FUNCTION public.update_achievement_progress(p_user_id uuid, p_achievement_id text, p_progress_increment integer DEFAULT 1)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  achievement_record RECORD;
  current_progress_record RECORD;
  new_progress INTEGER;
BEGIN
  -- Security check: Only allow users to update their own achievement progress
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  IF auth.uid() != p_user_id THEN
    RAISE EXCEPTION 'Access denied: You can only update your own achievement progress';
  END IF;

  SELECT * INTO achievement_record FROM achievements WHERE id = p_achievement_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Achievement not found: %', p_achievement_id; END IF;

  SELECT * INTO current_progress_record FROM user_achievement_progress WHERE user_id = p_user_id AND achievement_id = p_achievement_id;
  IF NOT FOUND THEN
    INSERT INTO user_achievement_progress (user_id, achievement_id, current_progress)
    VALUES (p_user_id, p_achievement_id, LEAST(p_progress_increment, achievement_record.total_required));
    new_progress := LEAST(p_progress_increment, achievement_record.total_required);
  ELSE
    new_progress := LEAST(current_progress_record.current_progress + p_progress_increment, achievement_record.total_required);
    UPDATE user_achievement_progress
    SET current_progress = new_progress, updated_at = now()
    WHERE user_id = p_user_id AND achievement_id = p_achievement_id;
  END IF;

  IF new_progress >= achievement_record.total_required THEN
    UPDATE user_achievement_progress
    SET is_completed = true, completed_at = now(), updated_at = now()
    WHERE user_id = p_user_id AND achievement_id = p_achievement_id;

    INSERT INTO user_achievements (user_id, achievement_id)
    VALUES (p_user_id, p_achievement_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;

    UPDATE user_stats
    SET achievement_points = achievement_points + achievement_record.points, updated_at = now()
    WHERE user_id = p_user_id;
  END IF;
END;
$function$;