-- Create trip_messages table for group chat
CREATE TABLE public.trip_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id UUID NOT NULL,
  user_id UUID NOT NULL,
  message TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.trip_messages ENABLE ROW LEVEL SECURITY;

-- Create policies for trip messages
CREATE POLICY "Trip collaborators can view messages" 
ON public.trip_messages 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.trips 
    WHERE id = trip_messages.trip_id 
    AND (user_id = auth.uid() OR is_trip_collaborator(id, auth.uid()))
  )
);

CREATE POLICY "Trip collaborators can create messages" 
ON public.trip_messages 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.trips 
    WHERE id = trip_messages.trip_id 
    AND (user_id = auth.uid() OR is_trip_collaborator(id, auth.uid()))
  )
);

CREATE POLICY "Users can update their own messages" 
ON public.trip_messages 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages" 
ON public.trip_messages 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_trip_messages_updated_at
BEFORE UPDATE ON public.trip_messages
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_trip_messages_trip_id ON public.trip_messages(trip_id);
CREATE INDEX idx_trip_messages_created_at ON public.trip_messages(created_at DESC);
CREATE INDEX idx_trip_messages_user_id ON public.trip_messages(user_id);

-- Enable realtime for trip_messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.trip_messages;