-- Add latitude and longitude columns to place_reviews table for location-specific reviews
ALTER TABLE public.place_reviews 
ADD COLUMN lat NUMERIC,
ADD COLUMN lng NUMERIC;

-- Create a composite index for efficient querying by coordinates
CREATE INDEX idx_place_reviews_coordinates ON public.place_reviews (lat, lng);

-- Create a composite index for querying by place_id and coordinates
CREATE INDEX idx_place_reviews_place_coords ON public.place_reviews (place_id, lat, lng);