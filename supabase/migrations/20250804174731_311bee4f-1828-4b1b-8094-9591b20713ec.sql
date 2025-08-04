-- Migración para resolver problemas de acceso post-invitación

-- 1. Crear tabla auxiliar para registro de acceso
CREATE TABLE IF NOT EXISTS public.trip_access_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(trip_id, user_id)
);

-- 2. Agregar campo collaborators_count a trips si no existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_name = 'trips' AND column_name = 'collaborators_count'
  ) THEN
    ALTER TABLE public.trips ADD COLUMN collaborators_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- 3. Función RPC para otorgar acceso a miembros del viaje
CREATE OR REPLACE FUNCTION public.grant_trip_member_access(p_trip_id UUID, p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Actualiza el contador de colaboradores para forzar refresh
  UPDATE public.trips
  SET 
    collaborators_count = (
      SELECT COUNT(*) FROM public.trip_collaborators 
      WHERE trip_id = p_trip_id
    ),
    is_group_trip = true,
    updated_at = now()
  WHERE id = p_trip_id;
  
  -- Marcar explícitamente el acceso para este usuario
  INSERT INTO public.trip_access_log (trip_id, user_id, granted_at)
  VALUES (p_trip_id, p_user_id, now())
  ON CONFLICT (trip_id, user_id) 
  DO UPDATE SET granted_at = now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Actualizar políticas RLS para trips (colaboradores pueden ver)
DROP POLICY IF EXISTS "Users can view their own trips or collaborative trips or invite" ON public.trips;
CREATE POLICY "Users can view their own trips or collaborative trips or invite" 
ON public.trips FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id OR 
  is_trip_collaborator(id, auth.uid()) OR 
  has_pending_invitation(id, auth.uid())
);

-- 5. Política para que colaboradores puedan actualizar trips (basado en rol editor)
CREATE POLICY IF NOT EXISTS "Collaborators can update trips" 
ON public.trips FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.trip_collaborators 
    WHERE trip_id = trips.id 
    AND user_id = auth.uid() 
    AND role = 'editor'
  )
);

-- 6. Actualizar políticas para saved_places (colaboradores pueden ver)
DROP POLICY IF EXISTS "Users can view saved places of their trips" ON public.saved_places;
CREATE POLICY "Users can view saved places of their trips" 
ON public.saved_places FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM trips
    WHERE trips.id = saved_places.trip_id 
    AND (
      trips.user_id = auth.uid() OR
      is_trip_collaborator(trips.id, auth.uid())
    )
  )
);

-- 7. Política para que colaboradores editores puedan modificar saved_places
CREATE POLICY IF NOT EXISTS "Collaborators can manage saved places" 
ON public.saved_places FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM trips t
    LEFT JOIN trip_collaborators tc ON tc.trip_id = t.id AND tc.user_id = auth.uid()
    WHERE t.id = saved_places.trip_id 
    AND (
      t.user_id = auth.uid() OR
      (tc.user_id IS NOT NULL AND tc.role = 'editor')
    )
  )
);

-- 8. Políticas para trip_coordinates (colaboradores pueden ver)
DROP POLICY IF EXISTS "Users can view coordinates of their trips" ON public.trip_coordinates;
CREATE POLICY "Users can view coordinates of their trips" 
ON public.trip_coordinates FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM trips
    WHERE trips.id = trip_coordinates.trip_id 
    AND (
      trips.user_id = auth.uid() OR
      is_trip_collaborator(trips.id, auth.uid())
    )
  )
);

-- 9. Habilitar RLS en trip_access_log
ALTER TABLE public.trip_access_log ENABLE ROW LEVEL SECURITY;

-- 10. Política para trip_access_log
CREATE POLICY "Users can view their own access log" 
ON public.trip_access_log FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- 11. Trigger para actualizar contador de colaboradores
CREATE OR REPLACE FUNCTION update_collaborators_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.trips
    SET 
      collaborators_count = (
        SELECT COUNT(*) FROM public.trip_collaborators 
        WHERE trip_id = NEW.trip_id
      ),
      is_group_trip = true,
      updated_at = now()
    WHERE id = NEW.trip_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.trips
    SET 
      collaborators_count = (
        SELECT COUNT(*) FROM public.trip_collaborators 
        WHERE trip_id = OLD.trip_id
      ),
      updated_at = now()
    WHERE id = OLD.trip_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 12. Crear trigger si no existe
DROP TRIGGER IF EXISTS trigger_update_collaborators_count ON public.trip_collaborators;
CREATE TRIGGER trigger_update_collaborators_count
  AFTER INSERT OR UPDATE OR DELETE ON public.trip_collaborators
  FOR EACH ROW EXECUTE FUNCTION update_collaborators_count();