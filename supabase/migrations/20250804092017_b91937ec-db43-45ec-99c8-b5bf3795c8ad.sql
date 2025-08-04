-- Crear índices optimizados para consultas de invitaciones
CREATE INDEX IF NOT EXISTS idx_trip_invitations_email ON public.trip_invitations(email);
CREATE INDEX IF NOT EXISTS idx_trip_invitations_token ON public.trip_invitations(token);
CREATE INDEX IF NOT EXISTS idx_trip_invitations_status_expires ON public.trip_invitations(status, expires_at);

-- Función RPC optimizada para aceptar invitaciones
CREATE OR REPLACE FUNCTION public.accept_invitation_optimized(
  invitation_token TEXT,
  user_email TEXT,
  user_id UUID
) RETURNS jsonb AS $$
DECLARE
  invitation_record RECORD;
  result jsonb;
BEGIN
  -- 1. Buscar y validar la invitación
  SELECT ti.*, t.name as trip_name
  INTO invitation_record
  FROM public.trip_invitations ti
  JOIN public.trips t ON t.id = ti.trip_id
  WHERE ti.token = invitation_token
    AND ti.email = user_email
    AND ti.status = 'pending'
    AND ti.expires_at > now();
    
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invitación no encontrada o ya respondida'
    );
  END IF;
  
  -- 2. Actualizar invitación
  UPDATE public.trip_invitations
  SET 
    status = 'accepted',
    accepted_at = now(),
    accepted_by = user_id,
    updated_at = now()
  WHERE token = invitation_token;
  
  -- 3. Agregar como colaborador
  INSERT INTO public.trip_collaborators (trip_id, user_id, role, email, name)
  SELECT 
    invitation_record.trip_id, 
    user_id, 
    invitation_record.role,
    user_email,
    p.full_name
  FROM public.profiles p
  WHERE p.id = user_id
  ON CONFLICT (trip_id, user_id) DO UPDATE SET
    role = EXCLUDED.role,
    email = EXCLUDED.email,
    name = EXCLUDED.name;
  
  -- 4. Actualizar trip a grupo si es necesario
  UPDATE public.trips
  SET 
    is_group_trip = true,
    updated_at = now()
  WHERE id = invitation_record.trip_id
    AND is_group_trip = false;
  
  -- 5. Retornar resultado exitoso
  RETURN jsonb_build_object(
    'success', true,
    'trip_id', invitation_record.trip_id,
    'trip_name', invitation_record.trip_name,
    'role', invitation_record.role
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false,
    'error', SQLERRM
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función optimizada para obtener invitaciones pendientes
CREATE OR REPLACE FUNCTION public.get_pending_invitations(user_email TEXT)
RETURNS TABLE(
  id uuid,
  token text,
  trip_id uuid,
  trip_name text,
  inviter_name text,
  role text,
  created_at timestamptz,
  expires_at timestamptz
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ti.id,
    ti.token,
    ti.trip_id,
    t.name as trip_name,
    p.full_name as inviter_name,
    ti.role,
    ti.created_at,
    ti.expires_at
  FROM public.trip_invitations ti
  JOIN public.trips t ON t.id = ti.trip_id
  JOIN public.profiles p ON p.id = ti.inviter_id
  WHERE ti.email = user_email
    AND ti.status = 'pending'
    AND ti.expires_at > now()
  ORDER BY ti.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;