
-- Create a table for place reviews
CREATE TABLE public.place_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  place_id TEXT NOT NULL,
  place_name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.place_reviews ENABLE ROW LEVEL SECURITY;

-- Create policy that allows users to SELECT all reviews (public read)
CREATE POLICY "Anyone can view place reviews" 
  ON public.place_reviews 
  FOR SELECT 
  USING (true);

-- Create policy that allows authenticated users to INSERT their own reviews
CREATE POLICY "Authenticated users can create reviews" 
  ON public.place_reviews 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Create policy that allows users to UPDATE their own reviews
CREATE POLICY "Users can update their own reviews" 
  ON public.place_reviews 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create policy that allows users to DELETE their own reviews
CREATE POLICY "Users can delete their own reviews" 
  ON public.place_reviews 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create index for better performance when querying by place_id
CREATE INDEX idx_place_reviews_place_id ON public.place_reviews(place_id);
CREATE INDEX idx_place_reviews_created_at ON public.place_reviews(created_at DESC);
