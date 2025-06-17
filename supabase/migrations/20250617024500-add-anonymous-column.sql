
-- Add anonymous column to place_reviews table
ALTER TABLE public.place_reviews 
ADD COLUMN anonymous BOOLEAN DEFAULT false;
