-- Make encryption_key_hash column nullable since we removed this functionality
-- for better cryptographic security
ALTER TABLE public.encrypted_travel_documents 
ALTER COLUMN encryption_key_hash DROP NOT NULL;