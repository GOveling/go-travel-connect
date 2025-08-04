-- Arreglar la función can_edit_trip para cumplir con seguridad
CREATE OR REPLACE FUNCTION public.can_edit_trip(p_trip_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    -- Owner can always edit
    SELECT 1 FROM public.trips 
    WHERE id = p_trip_id AND user_id = p_user_id
  ) OR EXISTS (
    -- Editors can edit
    SELECT 1 FROM public.trip_collaborators 
    WHERE trip_id = p_trip_id 
    AND user_id = p_user_id 
    AND role = 'editor'
  );
$$;

-- Eliminar la vista problemática de seguridad y crear una función en su lugar
DROP VIEW IF EXISTS public.trip_members;

-- Crear función para obtener miembros del trip en lugar de vista
CREATE OR REPLACE FUNCTION public.get_trip_members(p_trip_id uuid)
RETURNS TABLE(
  id uuid,
  trip_id uuid,
  user_id uuid,
  role text,
  created_at timestamp with time zone,
  name text,
  email text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    tc.id,
    tc.trip_id,
    tc.user_id,
    tc.role,
    tc.joined_at as created_at,
    tc.name,
    tc.email
  FROM public.trip_collaborators tc
  WHERE tc.trip_id = p_trip_id;
$$;