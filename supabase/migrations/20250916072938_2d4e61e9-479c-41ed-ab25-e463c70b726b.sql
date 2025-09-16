-- Reactivar RLS en la tabla
ALTER TABLE encrypted_travel_documents ENABLE ROW LEVEL SECURITY;

-- Eliminar la función administrativa temporal
DROP FUNCTION IF EXISTS admin_delete_document(uuid);