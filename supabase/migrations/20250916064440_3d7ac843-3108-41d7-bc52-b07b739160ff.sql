-- Fix foreign key constraint issues in document_access_log
-- Make the foreign key constraint deferrable so we can handle deletion order properly

-- First, drop the existing foreign key constraint
ALTER TABLE document_access_log 
DROP CONSTRAINT IF EXISTS document_access_log_document_id_fkey;

-- Recreate the constraint as CASCADE DELETE so related logs are automatically deleted
ALTER TABLE document_access_log 
ADD CONSTRAINT document_access_log_document_id_fkey 
FOREIGN KEY (document_id) 
REFERENCES encrypted_travel_documents(id) 
ON DELETE CASCADE;

-- Add missing indexes for better performance
CREATE INDEX IF NOT EXISTS idx_document_access_log_user_id ON document_access_log(user_id);
CREATE INDEX IF NOT EXISTS idx_document_access_log_document_id ON document_access_log(document_id);
CREATE INDEX IF NOT EXISTS idx_document_access_log_timestamp ON document_access_log(access_timestamp);

-- Add missing indexes on encrypted_travel_documents
CREATE INDEX IF NOT EXISTS idx_encrypted_travel_documents_user_id ON encrypted_travel_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_encrypted_travel_documents_created_at ON encrypted_travel_documents(created_at);

-- Ensure proper default values
ALTER TABLE encrypted_travel_documents 
ALTER COLUMN access_count SET DEFAULT 0;

ALTER TABLE encrypted_travel_documents 
ALTER COLUMN created_at SET DEFAULT now();

ALTER TABLE encrypted_travel_documents 
ALTER COLUMN updated_at SET DEFAULT now();