-- Add viewed_at field to general_notifications table
ALTER TABLE public.general_notifications 
ADD COLUMN viewed_at timestamp with time zone;

-- Create index for better performance on viewed_at queries
CREATE INDEX idx_general_notifications_viewed_at ON public.general_notifications(viewed_at);

-- Create index for better performance on user_id and created_at queries (for limiting to 20)
CREATE INDEX idx_general_notifications_user_created ON public.general_notifications(user_id, created_at DESC);