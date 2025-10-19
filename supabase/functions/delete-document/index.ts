import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Delete document function called');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Validate request method
    if (req.method !== 'POST') {
      console.error('Invalid method:', req.method);
      throw new Error(`Method ${req.method} not allowed`);
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      throw new Error('No authorization header');
    }

    console.log('Authenticating user...');
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      console.error('Authentication failed:', authError);
      throw new Error('Unauthorized');
    }

    console.log('User authenticated:', user.id);

    // Parse and validate request body
    let requestBody;
    try {
      const bodyText = await req.text();
      console.log('Request body text:', bodyText);
      requestBody = JSON.parse(bodyText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      throw new Error('Invalid JSON in request body');
    }

    const { documentId } = requestBody;

    if (!documentId) {
      console.error('Missing document ID in request');
      throw new Error('Document ID is required');
    }

    console.log(`Starting deletion process for document ${documentId} by user: ${user.id}`);

    // Step 1: Get document info first with proper error handling
    console.log('Fetching document from database...');
    const { data: document, error: getError } = await supabase
      .from('encrypted_travel_documents')
      .select('file_path, user_id')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (getError) {
      console.error('Database query error:', getError);
      throw new Error(`Database query failed: ${getError.message}`);
    }

    if (!document) {
      console.error('Document not found or access denied for:', { documentId, userId: user.id });
      throw new Error('Document not found or access denied');
    }

    console.log('Document found, file_path:', document.file_path);

    // Step 2: Delete document record FIRST to avoid any triggers or constraints
    console.log('Deleting document record from database...');
    
    const { error: deleteError, count } = await supabase
      .from('encrypted_travel_documents')
      .delete()
      .eq('id', documentId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Document deletion error:', deleteError);
      throw new Error(`Failed to delete document: ${deleteError.message}`);
    }

    if (count === 0) {
      console.log('No document was deleted - document may not exist or access denied');
      throw new Error('Document not found or already deleted');
    }

    console.log(`Document successfully deleted from database: ${documentId}`);

    // Step 3: Clean up related log entries after document deletion (non-critical)
    console.log('Cleaning up access logs...');
    try {
      const { error: logDeleteError } = await supabase
        .from('document_access_log')
        .delete()
        .eq('document_id', documentId);
      
      if (logDeleteError) {
        console.error('Access log cleanup error (non-critical):', logDeleteError);
      } else {
        console.log(`Successfully cleaned up access logs for document: ${documentId}`);
      }
    } catch (logError) {
      console.error('Exception during log cleanup (non-critical):', logError);
    }

    // Step 4: Delete file from storage if exists (non-critical)
    if (document.file_path) {
      console.log('Deleting file from storage:', document.file_path);
      try {
        const { error: storageError } = await supabase.storage
          .from('encrypted-travel-documents')
          .remove([document.file_path]);

        if (storageError) {
          console.error('Storage deletion error (non-critical):', storageError);
        } else {
          console.log(`Successfully deleted file from storage: ${document.file_path}`);
        }
      } catch (storageErr) {
        console.error('Exception during storage deletion (non-critical):', storageErr);
      }
    } else {
      console.log('No file_path found, skipping storage deletion');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Document deleted securely',
        documentId
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Critical error in delete-document function:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to delete document',
        details: error.stack ? error.stack.substring(0, 500) : 'No stack trace available'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);