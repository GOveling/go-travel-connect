-- Create secure travel documents table with AES-256 encryption
CREATE TABLE public.encrypted_travel_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  encrypted_metadata TEXT NOT NULL, -- AES-256 encrypted JSON metadata
  file_path TEXT, -- Path to encrypted file in storage
  encryption_key_hash TEXT NOT NULL, -- Hash of the encryption key for verification
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE, -- Document expiration
  access_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS with strict security
ALTER TABLE public.encrypted_travel_documents ENABLE ROW LEVEL SECURITY;

-- Only users can access their own encrypted documents
CREATE POLICY "Users can only access their own encrypted documents"
ON public.encrypted_travel_documents
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create document access audit log
CREATE TABLE public.document_access_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  document_id UUID NOT NULL REFERENCES public.encrypted_travel_documents(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL, -- 'create', 'read', 'update', 'delete', 'download'
  ip_address INET,
  user_agent TEXT,
  access_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  success BOOLEAN NOT NULL DEFAULT true,
  error_details TEXT
);

-- Enable RLS for audit log
ALTER TABLE public.document_access_log ENABLE ROW LEVEL SECURITY;

-- Users can only view their own access logs
CREATE POLICY "Users can view their own document access logs"
ON public.document_access_log
FOR SELECT
USING (auth.uid() = user_id);

-- Create private storage bucket for encrypted documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('encrypted-travel-documents', 'encrypted-travel-documents', false);

-- Storage policies for encrypted documents
CREATE POLICY "Users can upload their own encrypted documents"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'encrypted-travel-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own encrypted documents"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'encrypted-travel-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can update their own encrypted documents"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'encrypted-travel-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own encrypted documents"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'encrypted-travel-documents' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Function to update updated_at timestamp
CREATE TRIGGER update_encrypted_travel_documents_updated_at
BEFORE UPDATE ON public.encrypted_travel_documents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to log document access
CREATE OR REPLACE FUNCTION public.log_document_access()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.document_access_log (
    user_id, document_id, action_type, access_timestamp
  ) VALUES (
    COALESCE(NEW.user_id, OLD.user_id),
    COALESCE(NEW.id, OLD.id),
    CASE 
      WHEN TG_OP = 'INSERT' THEN 'create'
      WHEN TG_OP = 'UPDATE' THEN 'update'
      WHEN TG_OP = 'DELETE' THEN 'delete'
      ELSE 'read'
    END,
    now()
  );
  
  -- Update access count for reads
  IF TG_OP = 'UPDATE' AND OLD.access_count IS DISTINCT FROM NEW.access_count THEN
    UPDATE public.encrypted_travel_documents 
    SET last_accessed_at = now()
    WHERE id = NEW.id;
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for document access logging
CREATE TRIGGER log_document_access_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.encrypted_travel_documents
FOR EACH ROW EXECUTE FUNCTION public.log_document_access();