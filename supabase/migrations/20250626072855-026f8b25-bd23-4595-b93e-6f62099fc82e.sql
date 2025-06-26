
-- Create achievements table to store all travel achievements
CREATE TABLE public.achievements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT NOT NULL,
  icon TEXT NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  total_required INTEGER NOT NULL DEFAULT 1,
  criteria TEXT NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_achievement_progress table to track user progress on achievements
CREATE TABLE public.user_achievement_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_id TEXT NOT NULL REFERENCES public.achievements(id),
  current_progress INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS on both tables
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievement_progress ENABLE ROW LEVEL SECURITY;

-- RLS policies for achievements (publicly readable)
CREATE POLICY "Anyone can view achievements" ON public.achievements
  FOR SELECT USING (true);

-- RLS policies for user_achievement_progress (users can only see their own progress)
CREATE POLICY "Users can view their own progress" ON public.user_achievement_progress
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON public.user_achievement_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.user_achievement_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- Insert all the travel achievements from gamificationData
INSERT INTO public.achievements (id, title, description, category, icon, points, total_required, criteria, rarity) VALUES
('first-country', 'First Country Visited', 'Visit your first country outside your home', 'global-exploration', '🌍', 100, 1, 'Visit 1 country', 'common'),
('city-explorer', 'City Explorer', 'Explore 5 different cities', 'local-discoveries', '🏙️', 150, 5, 'Visit 5 cities', 'common'),
('foodie', 'Local Foodie', 'Try 20 different local dishes', 'food-nightlife', '🍜', 200, 20, 'Try 20 local dishes', 'rare'),
('culture-buff', 'Culture Buff', 'Visit 10 museums or cultural sites', 'local-discoveries', '🏛️', 250, 10, 'Visit 10 cultural sites', 'rare'),
('adventure-seeker', 'Adventure Seeker', 'Complete 5 outdoor activities', 'global-exploration', '🏔️', 300, 5, 'Complete 5 outdoor activities', 'epic'),
('night-owl', 'Night Owl', 'Experience nightlife in 8 different cities', 'food-nightlife', '🌙', 200, 8, 'Experience nightlife in 8 cities', 'rare'),
('family-traveler', 'Family Traveler', 'Complete 10 family-friendly activities', 'family-experience', '👨‍👩‍👧‍👦', 180, 10, 'Complete 10 family activities', 'common'),
('solo-explorer', 'Solo Explorer', 'Take 3 solo trips', 'global-exploration', '🎒', 250, 3, 'Complete 3 solo trips', 'rare'),
('continent-hopper', 'Continent Hopper', 'Visit all 7 continents', 'global-exploration', '🌏', 1000, 7, 'Visit all 7 continents', 'legendary'),
('local-guide', 'Local Guide', 'Create 15 travel guides', 'contributions', '📖', 300, 15, 'Create 15 travel guides', 'epic'),
('photo-master', 'Photo Master', 'Upload 100 travel photos', 'contributions', '📸', 200, 100, 'Upload 100 photos', 'rare'),
('review-champion', 'Review Champion', 'Write 50 place reviews', 'contributions', '⭐', 250, 50, 'Write 50 reviews', 'rare'),
('early-bird', 'Early Bird', 'Be among the first 100 users', 'special', '🐦', 500, 1, 'Join as early user', 'legendary'),
('anniversary', 'Anniversary Traveler', 'Travel on your account anniversary', 'special', '🎉', 150, 1, 'Travel on anniversary', 'epic'),
('world-wanderer', 'World Wanderer', 'Visit 50 different countries', 'global-exploration', '🗺️', 800, 50, 'Visit 50 countries', 'legendary'),
('budget-master', 'Budget Master', 'Complete 10 trips under budget', 'global-exploration', '💰', 200, 10, 'Complete 10 budget trips', 'rare'),
('luxury-traveler', 'Luxury Traveler', 'Stay in 5 luxury accommodations', 'global-exploration', '✨', 300, 5, 'Stay in 5 luxury places', 'epic'),
('backpacker', 'Backpacker', 'Complete 5 backpacking trips', 'global-exploration', '🎒', 250, 5, 'Complete 5 backpacking trips', 'rare'),
('publication-star', 'Publication Star', 'Get 100 likes on travel posts', 'publications', '💖', 200, 100, 'Get 100 likes', 'rare'),
('social-butterfly', 'Social Butterfly', 'Connect with 25 fellow travelers', 'social', '🦋', 150, 25, 'Connect with 25 travelers', 'common');

-- Function to update user achievement progress
CREATE OR REPLACE FUNCTION public.update_achievement_progress(
  p_user_id UUID,
  p_achievement_id TEXT,
  p_progress_increment INTEGER DEFAULT 1
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  achievement_record RECORD;
  current_progress_record RECORD;
  new_progress INTEGER;
BEGIN
  -- Get achievement details
  SELECT * INTO achievement_record 
  FROM public.achievements 
  WHERE id = p_achievement_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Achievement not found: %', p_achievement_id;
  END IF;
  
  -- Get or create user progress record
  SELECT * INTO current_progress_record
  FROM public.user_achievement_progress
  WHERE user_id = p_user_id AND achievement_id = p_achievement_id;
  
  IF NOT FOUND THEN
    -- Create new progress record
    INSERT INTO public.user_achievement_progress (user_id, achievement_id, current_progress)
    VALUES (p_user_id, p_achievement_id, LEAST(p_progress_increment, achievement_record.total_required));
    
    new_progress := LEAST(p_progress_increment, achievement_record.total_required);
  ELSE
    -- Update existing progress
    new_progress := LEAST(current_progress_record.current_progress + p_progress_increment, achievement_record.total_required);
    
    UPDATE public.user_achievement_progress
    SET 
      current_progress = new_progress,
      updated_at = now()
    WHERE user_id = p_user_id AND achievement_id = p_achievement_id;
  END IF;
  
  -- Check if achievement is completed
  IF new_progress >= achievement_record.total_required THEN
    UPDATE public.user_achievement_progress
    SET 
      is_completed = true,
      completed_at = now(),
      updated_at = now()
    WHERE user_id = p_user_id AND achievement_id = p_achievement_id;
    
    -- Update user_achievements table for backward compatibility
    INSERT INTO public.user_achievements (user_id, achievement_id)
    VALUES (p_user_id, p_achievement_id)
    ON CONFLICT (user_id, achievement_id) DO NOTHING;
    
    -- Award points to user_stats
    UPDATE public.user_stats
    SET 
      achievement_points = achievement_points + achievement_record.points,
      updated_at = now()
    WHERE user_id = p_user_id;
  END IF;
END;
$$;

-- Add unique constraint to user_achievements to prevent duplicates
ALTER TABLE public.user_achievements ADD CONSTRAINT user_achievements_unique UNIQUE (user_id, achievement_id);

-- Function to get user achievement progress with details
CREATE OR REPLACE FUNCTION public.get_user_achievements_with_progress(p_user_id UUID)
RETURNS TABLE (
  achievement_id TEXT,
  title TEXT,
  description TEXT,
  category TEXT,
  icon TEXT,
  points INTEGER,
  total_required INTEGER,
  criteria TEXT,
  rarity TEXT,
  current_progress INTEGER,
  is_completed BOOLEAN,
  completed_at TIMESTAMP WITH TIME ZONE,
  progress_percentage NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
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
  FROM public.achievements a
  LEFT JOIN public.user_achievement_progress uap ON a.id = uap.achievement_id AND uap.user_id = p_user_id
  ORDER BY a.category, a.rarity, a.title;
END;
$$;
