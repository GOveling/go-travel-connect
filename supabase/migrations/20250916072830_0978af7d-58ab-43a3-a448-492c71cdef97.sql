-- Crear una función administrativa para eliminar documentos específicos
CREATE OR REPLACE FUNCTION admin_delete_document(document_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Primero eliminar logs de acceso relacionados para evitar constraint issues
  DELETE FROM document_access_log WHERE document_id = admin_delete_document.document_id;
  
  -- Luego eliminar el documento
  DELETE FROM encrypted_travel_documents WHERE id = admin_delete_document.document_id;
  
  -- Verificar si se eliminó
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;