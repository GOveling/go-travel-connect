-- Create the trip_members table that the frontend expects
CREATE TABLE IF NOT EXISTS public.trip_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id uuid NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('editor', 'viewer')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(trip_id, user_id)
);

-- Enable RLS
ALTER TABLE public.trip_members ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for trip_members
CREATE POLICY "Trip owners can manage members" 
ON public.trip_members 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.trips 
    WHERE id = trip_members.trip_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Members can view their memberships" 
ON public.trip_members 
FOR SELECT 
USING (
  user_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.trips 
    WHERE id = trip_members.trip_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert themselves as members when accepting invitation" 
ON public.trip_members 
FOR INSERT 
WITH CHECK (
  user_id = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.trip_invitations ti
    WHERE ti.trip_id = trip_members.trip_id
    AND ti.email = (SELECT email FROM public.profiles WHERE id = auth.uid())
    AND ti.status = 'pending'
    AND ti.expires_at > now()
  )
);

-- Update the trips table to use 'type' column instead of 'is_group_trip'
ALTER TABLE public.trips 
ADD COLUMN IF NOT EXISTS type text DEFAULT 'solo' CHECK (type IN ('solo', 'group'));

-- Update existing trips
UPDATE public.trips 
SET type = CASE 
  WHEN is_group_trip = true THEN 'group' 
  ELSE 'solo' 
END
WHERE type IS NULL;

-- Create or replace the accept_trip_invitation function to work with trip_members
CREATE OR REPLACE FUNCTION public.accept_trip_invitation_v2(
  p_token text
) 
RETURNS boolean 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  invitation_record RECORD;
  user_email text;
BEGIN
  -- Get user email
  SELECT email INTO user_email 
  FROM public.profiles 
  WHERE id = auth.uid();

  IF user_email IS NULL THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  -- Get invitation with trip details
  SELECT ti.*, t.name as trip_name, t.user_id as trip_owner_id
  INTO invitation_record
  FROM public.trip_invitations ti
  JOIN public.trips t ON t.id = ti.trip_id
  WHERE ti.token = p_token
  AND ti.status = 'pending'
  AND ti.expires_at > now()
  AND ti.email = user_email;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invalid, expired, or already processed invitation';
  END IF;

  -- Add user as member in trip_members table
  INSERT INTO public.trip_members (trip_id, user_id, role)
  VALUES (
    invitation_record.trip_id,
    auth.uid(),
    invitation_record.role
  )
  ON CONFLICT (trip_id, user_id) DO UPDATE SET
    role = EXCLUDED.role,
    updated_at = now();

  -- Update invitation status
  UPDATE public.trip_invitations
  SET 
    status = 'accepted',
    accepted_at = now(),
    accepted_by = auth.uid(),
    updated_at = now()
  WHERE id = invitation_record.id;

  -- Update trip type to group
  UPDATE public.trips
  SET 
    type = 'group',
    updated_at = now()
  WHERE id = invitation_record.trip_id
  AND type = 'solo';

  RETURN true;
END;
$$;

-- Create trigger for updated_at on trip_members
CREATE OR REPLACE FUNCTION public.update_trip_members_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_trip_members_updated_at_trigger
  BEFORE UPDATE ON public.trip_members
  FOR EACH ROW
  EXECUTE FUNCTION public.update_trip_members_updated_at();