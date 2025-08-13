-- Enable realtime for trip_collaborators table
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_collaborators;

-- Set replica identity to full to capture all data on changes
ALTER TABLE public.trip_collaborators REPLICA IDENTITY FULL;