-- Primero, eliminar el trigger problemático
DROP TRIGGER IF EXISTS log_document_access_trigger ON encrypted_travel_documents;

-- Eliminar la función del trigger también
DROP FUNCTION IF EXISTS log_document_access();

-- Ahora eliminar el foreign key problemático
ALTER TABLE encrypted_travel_documents 
DROP CONSTRAINT IF EXISTS encrypted_travel_documents_user_id_fkey;

-- Eliminar todos los datos existentes que están corruptos
DELETE FROM document_access_log;
DELETE FROM encrypted_travel_documents;