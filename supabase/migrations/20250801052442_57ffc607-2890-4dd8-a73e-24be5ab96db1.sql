-- Create trip invitations table
CREATE TABLE public.trip_invitations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id uuid NOT NULL,
  inviter_id uuid NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'viewer',
  token text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  accepted_at timestamp with time zone,
  accepted_by uuid
);

-- Enable RLS
ALTER TABLE public.trip_invitations ENABLE ROW LEVEL SECURITY;

-- Create policies for trip invitations
CREATE POLICY "Trip owners can manage invitations"
ON public.trip_invitations
FOR ALL
USING (EXISTS (
  SELECT 1 FROM trips 
  WHERE trips.id = trip_invitations.trip_id 
  AND trips.user_id = auth.uid()
));

CREATE POLICY "Users can view invitations sent to them"
ON public.trip_invitations
FOR SELECT
USING (email IN (
  SELECT email FROM profiles WHERE id = auth.uid()
));

CREATE POLICY "Users can accept their own invitations"
ON public.trip_invitations
FOR UPDATE
USING (email IN (
  SELECT email FROM profiles WHERE id = auth.uid()
))
WITH CHECK (status IN ('accepted', 'declined'));

-- Create function to generate secure invitation tokens
CREATE OR REPLACE FUNCTION public.generate_invitation_token()
RETURNS text AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to send trip invitation
CREATE OR REPLACE FUNCTION public.send_trip_invitation(
  p_trip_id uuid,
  p_email text,
  p_role text DEFAULT 'viewer'
)
RETURNS uuid AS $$
DECLARE
  invitation_id uuid;
  invitation_token text;
  trip_name text;
  inviter_name text;
BEGIN
  -- Check if user is trip owner
  IF NOT EXISTS (
    SELECT 1 FROM trips 
    WHERE id = p_trip_id AND user_id = auth.uid()
  ) THEN
    RAISE EXCEPTION 'Only trip owners can send invitations';
  END IF;

  -- Get trip and inviter details
  SELECT t.name, p.full_name
  INTO trip_name, inviter_name
  FROM trips t
  JOIN profiles p ON p.id = auth.uid()
  WHERE t.id = p_trip_id;

  -- Generate secure token
  invitation_token := generate_invitation_token();

  -- Create invitation
  INSERT INTO public.trip_invitations (
    trip_id, inviter_id, email, role, token, expires_at
  ) VALUES (
    p_trip_id, 
    auth.uid(), 
    lower(trim(p_email)), 
    p_role, 
    invitation_token,
    now() + interval '7 days'
  ) RETURNING id INTO invitation_id;

  RETURN invitation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to accept trip invitation
CREATE OR REPLACE FUNCTION public.accept_trip_invitation(p_token text)
RETURNS boolean AS $$
DECLARE
  invitation_record record;
  user_email text;
BEGIN
  -- Get user email
  SELECT email INTO user_email 
  FROM profiles 
  WHERE id = auth.uid();

  -- Get invitation
  SELECT * INTO invitation_record
  FROM trip_invitations
  WHERE token = p_token
  AND status = 'pending'
  AND expires_at > now()
  AND email = user_email;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Update invitation status
  UPDATE trip_invitations
  SET 
    status = 'accepted',
    accepted_at = now(),
    accepted_by = auth.uid(),
    updated_at = now()
  WHERE id = invitation_record.id;

  -- Add user as collaborator
  INSERT INTO trip_collaborators (trip_id, user_id, role, email, name)
  VALUES (
    invitation_record.trip_id,
    auth.uid(),
    invitation_record.role,
    user_email,
    (SELECT full_name FROM profiles WHERE id = auth.uid())
  )
  ON CONFLICT (trip_id, user_id) DO UPDATE SET
    role = EXCLUDED.role,
    updated_at = now();

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updated_at
CREATE TRIGGER update_trip_invitations_updated_at
BEFORE UPDATE ON public.trip_invitations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();