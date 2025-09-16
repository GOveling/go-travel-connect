-- Primero, corregir la función administrativa
DROP FUNCTION IF EXISTS admin_delete_document(uuid);

-- Crear una función administrativa mejorada para eliminar documentos
CREATE OR REPLACE FUNCTION admin_delete_document(target_document_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Primero eliminar logs de acceso relacionados
  DELETE FROM document_access_log WHERE document_access_log.document_id = target_document_id;
  
  -- Luego eliminar el documento
  DELETE FROM encrypted_travel_documents WHERE encrypted_travel_documents.id = target_document_id;
  
  -- Verificar si se eliminó
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- Deshabilitar temporalmente RLS en la tabla para poder limpiar
ALTER TABLE encrypted_travel_documents DISABLE ROW LEVEL SECURITY;