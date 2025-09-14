-- Create general notifications table
CREATE TABLE public.general_notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL, -- recipient
  trip_id uuid NOT NULL,
  type text NOT NULL, -- 'place_added', 'place_updated', 'expense_added', 'expense_updated', 'decision_added', 'decision_updated'
  title text NOT NULL,
  message text NOT NULL,
  actor_user_id uuid NOT NULL, -- who performed the action
  actor_name text NOT NULL,
  is_read boolean NOT NULL DEFAULT false,
  icon text NOT NULL DEFAULT 'Bell',
  color text NOT NULL DEFAULT 'text-blue-600',
  related_id uuid, -- ID of the related place/expense/decision
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.general_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications" 
ON public.general_notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.general_notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

-- System can insert notifications
CREATE POLICY "System can insert notifications" 
ON public.general_notifications 
FOR INSERT 
WITH CHECK (true);

-- Create function to send notification to trip members
CREATE OR REPLACE FUNCTION public.notify_trip_members(
  p_trip_id uuid,
  p_actor_user_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_related_id uuid DEFAULT NULL,
  p_icon text DEFAULT 'Bell',
  p_color text DEFAULT 'text-blue-600'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  actor_name text;
  member_record RECORD;
BEGIN
  -- Get actor name
  SELECT full_name INTO actor_name FROM profiles WHERE id = p_actor_user_id;
  IF actor_name IS NULL THEN
    actor_name := 'Someone';
  END IF;

  -- Insert notifications for all trip members except the actor
  -- Trip owner
  INSERT INTO general_notifications (
    user_id, trip_id, type, title, message, actor_user_id, actor_name, 
    related_id, icon, color
  )
  SELECT 
    t.user_id, p_trip_id, p_type, p_title, p_message, p_actor_user_id, actor_name,
    p_related_id, p_icon, p_color
  FROM trips t
  WHERE t.id = p_trip_id 
    AND t.user_id != p_actor_user_id;

  -- Trip collaborators
  INSERT INTO general_notifications (
    user_id, trip_id, type, title, message, actor_user_id, actor_name, 
    related_id, icon, color
  )
  SELECT 
    tc.user_id, p_trip_id, p_type, p_title, p_message, p_actor_user_id, actor_name,
    p_related_id, p_icon, p_color
  FROM trip_collaborators tc
  WHERE tc.trip_id = p_trip_id 
    AND tc.user_id != p_actor_user_id;
END;
$$;

-- Trigger function for saved places
CREATE OR REPLACE FUNCTION public.notify_saved_place_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  trip_is_group boolean;
  actor_user_id uuid;
BEGIN
  -- Check if trip is a group trip
  SELECT is_group_trip INTO trip_is_group 
  FROM trips 
  WHERE id = COALESCE(NEW.trip_id, OLD.trip_id);
  
  IF NOT trip_is_group THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Get the actor (authenticated user)
  actor_user_id := auth.uid();
  IF actor_user_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF TG_OP = 'INSERT' THEN
    PERFORM notify_trip_members(
      NEW.trip_id,
      actor_user_id,
      'place_added',
      'New place added',
      'added "' || NEW.name || '" to the trip',
      NEW.id,
      'MapPin',
      'text-green-600'
    );
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM notify_trip_members(
      NEW.trip_id,
      actor_user_id,
      'place_updated',
      'Place updated',
      'updated "' || NEW.name || '"',
      NEW.id,
      'MapPin',
      'text-blue-600'
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger function for trip expenses
CREATE OR REPLACE FUNCTION public.notify_expense_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  trip_is_group boolean;
  actor_user_id uuid;
BEGIN
  -- Check if trip is a group trip
  SELECT is_group_trip INTO trip_is_group 
  FROM trips 
  WHERE id = COALESCE(NEW.trip_id, OLD.trip_id);
  
  IF NOT trip_is_group THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Get the actor (authenticated user)
  actor_user_id := auth.uid();
  IF actor_user_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF TG_OP = 'INSERT' THEN
    PERFORM notify_trip_members(
      NEW.trip_id,
      actor_user_id,
      'expense_added',
      'New expense added',
      'added expense "' || NEW.description || '" ($' || NEW.amount || ')',
      NEW.id,
      'DollarSign',
      'text-orange-600'
    );
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM notify_trip_members(
      NEW.trip_id,
      actor_user_id,
      'expense_updated',
      'Expense updated',
      'updated expense "' || NEW.description || '"',
      NEW.id,
      'DollarSign',
      'text-blue-600'
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Trigger function for trip decisions
CREATE OR REPLACE FUNCTION public.notify_decision_changes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  trip_is_group boolean;
  actor_user_id uuid;
BEGIN
  -- Check if trip is a group trip
  SELECT is_group_trip INTO trip_is_group 
  FROM trips 
  WHERE id = COALESCE(NEW.trip_id, OLD.trip_id);
  
  IF NOT trip_is_group THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Get the actor (authenticated user)
  actor_user_id := auth.uid();
  IF actor_user_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  IF TG_OP = 'INSERT' THEN
    PERFORM notify_trip_members(
      NEW.trip_id,
      actor_user_id,
      'decision_added',
      'New group decision',
      'created decision "' || NEW.title || '"',
      NEW.id,
      'Vote',
      'text-purple-600'
    );
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM notify_trip_members(
      NEW.trip_id,
      actor_user_id,
      'decision_updated',
      'Decision updated',
      'updated decision "' || NEW.title || '"',
      NEW.id,
      'Vote',
      'text-blue-600'
    );
  END IF;

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Create triggers
CREATE TRIGGER notify_saved_place_changes_trigger
  AFTER INSERT OR UPDATE ON public.saved_places
  FOR EACH ROW EXECUTE FUNCTION notify_saved_place_changes();

CREATE TRIGGER notify_expense_changes_trigger
  AFTER INSERT OR UPDATE ON public.trip_expenses
  FOR EACH ROW EXECUTE FUNCTION notify_expense_changes();

CREATE TRIGGER notify_decision_changes_trigger
  AFTER INSERT OR UPDATE ON public.trip_decisions
  FOR EACH ROW EXECUTE FUNCTION notify_decision_changes();

-- Create updated_at trigger for general_notifications
CREATE TRIGGER update_general_notifications_updated_at
  BEFORE UPDATE ON public.general_notifications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();