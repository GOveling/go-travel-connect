-- Eliminar el foreign key problemático que hace referencia a auth.users
ALTER TABLE encrypted_travel_documents 
DROP CONSTRAINT IF EXISTS encrypted_travel_documents_user_id_fkey;

-- Limpiar los datos corruptos que tienen metadata incompleta
DELETE FROM encrypted_travel_documents 
WHERE encrypted_metadata NOT LIKE '%"salt":%' 
   OR encrypted_metadata NOT LIKE '%"tag":%';

-- Limpiar logs huérfanos después de eliminar documentos
DELETE FROM document_access_log 
WHERE document_id NOT IN (SELECT id FROM encrypted_travel_documents);