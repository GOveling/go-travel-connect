-- Create trip_expenses table for group expenses
CREATE TABLE public.trip_expenses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id uuid NOT NULL,
  description text NOT NULL,
  amount numeric NOT NULL,
  paid_by jsonb NOT NULL DEFAULT '[]'::jsonb,
  split_between jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid NOT NULL
);

-- Create trip_decisions table for group decisions
CREATE TABLE public.trip_decisions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  options jsonb NOT NULL DEFAULT '[]'::jsonb,
  end_date timestamp with time zone,
  status text NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid NOT NULL,
  selected_participants jsonb NOT NULL DEFAULT '[]'::jsonb
);

-- Create trip_decision_votes table for voting on decisions
CREATE TABLE public.trip_decision_votes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  decision_id uuid NOT NULL,
  user_id uuid NOT NULL,
  option_index integer NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(decision_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.trip_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_decision_votes ENABLE ROW LEVEL SECURITY;

-- RLS policies for trip_expenses
CREATE POLICY "Trip members can view expenses" ON public.trip_expenses
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM trips t
    WHERE t.id = trip_expenses.trip_id 
    AND (t.user_id = auth.uid() OR is_trip_collaborator(t.id, auth.uid()))
  )
);

CREATE POLICY "Trip members can create expenses" ON public.trip_expenses
FOR INSERT WITH CHECK (
  auth.uid() = created_by AND
  EXISTS (
    SELECT 1 FROM trips t
    WHERE t.id = trip_expenses.trip_id 
    AND (t.user_id = auth.uid() OR is_trip_collaborator(t.id, auth.uid()))
  )
);

CREATE POLICY "Trip members can update expenses" ON public.trip_expenses
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM trips t
    WHERE t.id = trip_expenses.trip_id 
    AND (t.user_id = auth.uid() OR is_trip_collaborator(t.id, auth.uid()))
  )
);

CREATE POLICY "Trip members can delete expenses" ON public.trip_expenses
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM trips t
    WHERE t.id = trip_expenses.trip_id 
    AND (t.user_id = auth.uid() OR is_trip_collaborator(t.id, auth.uid()))
  )
);

-- RLS policies for trip_decisions
CREATE POLICY "Trip members can view decisions" ON public.trip_decisions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM trips t
    WHERE t.id = trip_decisions.trip_id 
    AND (t.user_id = auth.uid() OR is_trip_collaborator(t.id, auth.uid()))
  )
);

CREATE POLICY "Trip members can create decisions" ON public.trip_decisions
FOR INSERT WITH CHECK (
  auth.uid() = created_by AND
  EXISTS (
    SELECT 1 FROM trips t
    WHERE t.id = trip_decisions.trip_id 
    AND (t.user_id = auth.uid() OR is_trip_collaborator(t.id, auth.uid()))
  )
);

CREATE POLICY "Trip members can update decisions" ON public.trip_decisions
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM trips t
    WHERE t.id = trip_decisions.trip_id 
    AND (t.user_id = auth.uid() OR is_trip_collaborator(t.id, auth.uid()))
  )
);

CREATE POLICY "Trip members can delete decisions" ON public.trip_decisions
FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM trips t
    WHERE t.id = trip_decisions.trip_id 
    AND (t.user_id = auth.uid() OR is_trip_collaborator(t.id, auth.uid()))
  )
);

-- RLS policies for trip_decision_votes
CREATE POLICY "Trip members can view votes" ON public.trip_decision_votes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM trip_decisions td
    JOIN trips t ON t.id = td.trip_id
    WHERE td.id = trip_decision_votes.decision_id 
    AND (t.user_id = auth.uid() OR is_trip_collaborator(t.id, auth.uid()))
  )
);

CREATE POLICY "Users can create their own votes" ON public.trip_decision_votes
FOR INSERT WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM trip_decisions td
    JOIN trips t ON t.id = td.trip_id
    WHERE td.id = trip_decision_votes.decision_id 
    AND (t.user_id = auth.uid() OR is_trip_collaborator(t.id, auth.uid()))
  )
);

CREATE POLICY "Users can update their own votes" ON public.trip_decision_votes
FOR UPDATE USING (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM trip_decisions td
    JOIN trips t ON t.id = td.trip_id
    WHERE td.id = trip_decision_votes.decision_id 
    AND (t.user_id = auth.uid() OR is_trip_collaborator(t.id, auth.uid()))
  )
);

CREATE POLICY "Users can delete their own votes" ON public.trip_decision_votes
FOR DELETE USING (
  auth.uid() = user_id
);

-- Add foreign key constraints
ALTER TABLE public.trip_expenses ADD CONSTRAINT trip_expenses_trip_id_fkey 
FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE CASCADE;

ALTER TABLE public.trip_decisions ADD CONSTRAINT trip_decisions_trip_id_fkey 
FOREIGN KEY (trip_id) REFERENCES public.trips(id) ON DELETE CASCADE;

ALTER TABLE public.trip_decision_votes ADD CONSTRAINT trip_decision_votes_decision_id_fkey 
FOREIGN KEY (decision_id) REFERENCES public.trip_decisions(id) ON DELETE CASCADE;

-- Add triggers for updated_at
CREATE TRIGGER update_trip_expenses_updated_at
  BEFORE UPDATE ON public.trip_expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trip_decisions_updated_at
  BEFORE UPDATE ON public.trip_decisions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_trip_decision_votes_updated_at
  BEFORE UPDATE ON public.trip_decision_votes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();