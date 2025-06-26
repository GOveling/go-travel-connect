
-- Insert new travel achievements
INSERT INTO public.achievements (id, title, description, category, icon, points, total_required, criteria, rarity) VALUES
-- Culture achievements
('theatre-lover', 'Theatre Lover', 'Visit 5 different theatres', 'local-discoveries', '🎭', 200, 5, 'Visit 5 theatres', 'epic'),
('museum-admirer', 'Museum Admirer', 'Visit 10 different Museums in the World', 'local-discoveries', '🏛️', 350, 10, 'Visit 10 museums', 'legendary'),
-- Food achievements
('sweet-life', 'Sweet Life', 'Visit 10 bakeries', 'food-nightlife', '🧁', 150, 10, 'Visit 10 bakeries', 'common'),
-- Nature achievements
('beach-lover', 'Beach Lover', 'Visit 10 beaches in the world', 'global-exploration', '🏖️', 400, 10, 'Visit 10 beaches', 'epic'),
('natural-parker', 'Natural Parker', 'Visit 10 Natural Parks', 'global-exploration', '🌲', 400, 10, 'Visit 10 natural parks', 'epic'),
('lake-lover', 'Lake Lover', 'Visit 5 lakes in the world', 'global-exploration', '🏞️', 300, 5, 'Visit 5 lakes', 'epic');
