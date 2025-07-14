-- Create table for storing AI generated itineraries
CREATE TABLE public.ai_itineraries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL,
  user_id UUID NOT NULL,
  route_type TEXT NOT NULL CHECK (route_type IN ('current', 'speed', 'leisure')),
  itinerary_data JSONB NOT NULL,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ai_itineraries ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own itineraries" 
ON public.ai_itineraries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own itineraries" 
ON public.ai_itineraries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own itineraries" 
ON public.ai_itineraries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own itineraries" 
ON public.ai_itineraries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates (function already exists)
CREATE TRIGGER update_ai_itineraries_updated_at
BEFORE UPDATE ON public.ai_itineraries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();