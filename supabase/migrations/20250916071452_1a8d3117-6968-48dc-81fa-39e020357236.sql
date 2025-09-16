-- Create a safe document deletion function to handle foreign key constraints
CREATE OR REPLACE FUNCTION public.delete_document_safely(
  p_document_id UUID,
  p_user_id UUID
) 
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  doc_exists BOOLEAN;
BEGIN
  -- Check if document exists and belongs to user
  SELECT EXISTS(
    SELECT 1 FROM encrypted_travel_documents 
    WHERE id = p_document_id AND user_id = p_user_id
  ) INTO doc_exists;
  
  IF NOT doc_exists THEN
    RAISE EXCEPTION 'Document not found or access denied';
  END IF;
  
  -- Delete any remaining access logs (should already be deleted, but just in case)
  DELETE FROM document_access_log 
  WHERE document_id = p_document_id;
  
  -- Delete the document
  DELETE FROM encrypted_travel_documents 
  WHERE id = p_document_id AND user_id = p_user_id;
  
  RETURN TRUE;
END;
$$;