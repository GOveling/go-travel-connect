
-- Update category for existing achievements
UPDATE public.achievements SET category = 'family-experience' WHERE id IN ('beach-lover', 'natural-parker', 'lake-lover');
UPDATE public.achievements SET category = 'global-exploration' WHERE id = 'city-explorer';
UPDATE public.achievements SET category = 'special' WHERE id = 'family-traveler';

-- Insert new achievements for Special category
INSERT INTO public.achievements (id, title, description, category, icon, points, total_required, criteria, rarity) VALUES
('travel-for-two', 'Travel for Two', 'Complete 5 travels with a partner', 'special', '💑', 300, 5, 'Complete 5 travels with a partner', 'common'),
('group-travel', 'Group Travel', 'Complete 10 Group Trips', 'special', '👥', 500, 10, 'Complete 10 group trips', 'legendary');

-- Insert new achievements for Reviews category (contributions)
INSERT INTO public.achievements (id, title, description, category, icon, points, total_required, criteria, rarity) VALUES
('new-trip', 'New Trip', 'Create your First Trip in Goveling', 'contributions', '✈️', 100, 1, 'Create your first trip in Goveling', 'common'),
('trip-master', 'Trip Master', 'Create 20 Trip plans in Goveling', 'contributions', '🗺️', 400, 20, 'Create 20 trip plans in Goveling', 'epic'),
('dreamer', 'Dreamer', 'Create 100 Trip plans in Goveling', 'contributions', '🌟', 800, 100, 'Create 100 trip plans in Goveling', 'legendary');
