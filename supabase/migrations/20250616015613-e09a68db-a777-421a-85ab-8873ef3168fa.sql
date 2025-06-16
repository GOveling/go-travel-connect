
-- Create trips table for real trip data
CREATE TABLE public.trips (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  destination TEXT NOT NULL,
  dates TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'planning',
  travelers INTEGER DEFAULT 1,
  image TEXT,
  is_group_trip BOOLEAN DEFAULT false,
  description TEXT,
  budget TEXT,
  accommodation TEXT,
  transportation TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_stats table for tracking statistics
CREATE TABLE public.user_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL UNIQUE,
  countries_visited INTEGER DEFAULT 0,
  cities_explored INTEGER DEFAULT 0,
  places_visited INTEGER DEFAULT 0,
  achievement_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_activities table for recent activity tracking
CREATE TABLE public.user_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  activity_type TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_achievements table for tracking earned badges
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  achievement_id TEXT NOT NULL,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable Row Level Security
ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for trips table
CREATE POLICY "Users can view their own trips" 
  ON public.trips 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own trips" 
  ON public.trips 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trips" 
  ON public.trips 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trips" 
  ON public.trips 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create RLS policies for user_stats table
CREATE POLICY "Users can view their own stats" 
  ON public.user_stats 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own stats" 
  ON public.user_stats 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" 
  ON public.user_stats 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create RLS policies for user_activities table
CREATE POLICY "Users can view their own activities" 
  ON public.user_activities 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own activities" 
  ON public.user_activities 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for user_achievements table
CREATE POLICY "Users can view their own achievements" 
  ON public.user_achievements 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own achievements" 
  ON public.user_achievements 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create function to initialize user stats when profile is created
CREATE OR REPLACE FUNCTION public.initialize_user_stats() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to initialize stats when user signs up
CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.initialize_user_stats();

-- Function to update user stats when trips are completed
CREATE OR REPLACE FUNCTION public.update_user_stats_on_trip_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- Only update if trip status changed to completed
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    UPDATE public.user_stats 
    SET 
      places_visited = places_visited + 1,
      cities_explored = cities_explored + 1,
      updated_at = NOW()
    WHERE user_id = NEW.user_id;
    
    -- Add activity for trip completion
    INSERT INTO public.user_activities (user_id, activity_type, description, icon)
    VALUES (NEW.user_id, 'trip_completed', 'Completed trip to ' || NEW.destination, 'MapPin');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for trip completion stats update
CREATE TRIGGER on_trip_status_change
  AFTER UPDATE ON public.trips
  FOR EACH ROW EXECUTE FUNCTION public.update_user_stats_on_trip_completion();
