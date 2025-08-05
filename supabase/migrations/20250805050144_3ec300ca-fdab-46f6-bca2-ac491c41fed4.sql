-- Create the atomic accept_trip_invitation RPC function
CREATE OR REPLACE FUNCTION public.accept_trip_invitation(
  p_token TEXT,
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  v_invitation RECORD;
  v_result JSONB;
BEGIN
  -- Get invitation details
  SELECT * INTO v_invitation
  FROM trip_invitations
  WHERE token = p_token
  AND status = 'pending'
  AND expires_at > NOW();
  
  -- Check if invitation exists
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'message', 'Invitation not found or expired'
    );
  END IF;
  
  -- Check if user is already a member
  IF EXISTS (
    SELECT 1 FROM trip_members
    WHERE trip_id = v_invitation.trip_id
    AND user_id = p_user_id
  ) THEN
    -- Just update invitation status without adding duplicate member
    UPDATE trip_invitations
    SET status = 'accepted',
        accepted_at = NOW(),
        updated_at = NOW()
    WHERE id = v_invitation.id;
    
    RETURN jsonb_build_object(
      'success', true,
      'message', 'Invitation accepted, user was already a member'
    );
  END IF;
  
  -- Begin transaction steps:
  
  -- 1. Add member record
  INSERT INTO trip_members (
    trip_id, 
    user_id, 
    role, 
    created_at
  ) VALUES (
    v_invitation.trip_id,
    p_user_id,
    v_invitation.role,
    NOW()
  );
  
  -- 2. Update invitation status
  UPDATE trip_invitations
  SET status = 'accepted',
      accepted_at = NOW(),
      updated_at = NOW()
  WHERE id = v_invitation.id;
  
  -- 3. Update trip type if needed
  UPDATE trips
  SET type = 'group',
      updated_at = NOW()
  WHERE id = v_invitation.trip_id
  AND type = 'solo';
  
  -- Return success
  RETURN jsonb_build_object(
    'success', true,
    'message', 'Invitation accepted and member added successfully',
    'trip_id', v_invitation.trip_id,
    'role', v_invitation.role
  );
  
EXCEPTION WHEN OTHERS THEN
  -- Return error
  RETURN jsonb_build_object(
    'success', false,
    'message', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;