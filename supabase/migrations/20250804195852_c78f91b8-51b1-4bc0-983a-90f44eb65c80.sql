-- Verificar y optimizar la estructura de colaboradores
-- Si trip_members no existe, crear una vista o renombrar trip_collaborators

-- Agregar índices para mejorar performance de consultas de permisos
CREATE INDEX IF NOT EXISTS idx_trip_collaborators_user_trip 
ON public.trip_collaborators(user_id, trip_id);

CREATE INDEX IF NOT EXISTS idx_trip_collaborators_trip_role 
ON public.trip_collaborators(trip_id, role);

-- Crear función para verificar permisos de edición de manera eficiente
CREATE OR REPLACE FUNCTION public.can_edit_trip(p_trip_id uuid, p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
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

-- Crear vista simplificada para compatibilidad con trip_members
CREATE OR REPLACE VIEW public.trip_members AS
SELECT 
  id,
  trip_id,
  user_id,
  role,
  joined_at as created_at,
  name,
  email
FROM public.trip_collaborators;