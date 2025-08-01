-- Update send_trip_invitation function to accept token as parameter
CREATE OR REPLACE FUNCTION public.send_trip_invitation(
  p_trip_id uuid, 
  p_email text, 
  p_role text DEFAULT 'viewer'::text,
  p_token text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
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

  -- Use provided token or generate a simple one
  IF p_token IS NOT NULL THEN
    invitation_token := p_token;
  ELSE
    -- Fallback: generate using base64 (not base64url)
    invitation_token := encode(gen_random_bytes(32), 'base64');
  END IF;

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
$function$;