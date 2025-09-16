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

    // Step 2: Delete related log entries first to avoid foreign key constraint issues
    console.log('Deleting access logs...');
    try {
      const { error: logDeleteError } = await supabase
        .from('document_access_log')
        .delete()
        .eq('document_id', documentId);
      
      if (logDeleteError) {
        console.error('Access log deletion error (continuing anyway):', logDeleteError);
      } else {
        console.log(`Successfully deleted access logs for document: ${documentId}`);
      }
    } catch (logError) {
      console.error('Exception during log deletion (continuing anyway):', logError);
    }

    // Step 3: Delete file from storage if exists (non-critical)
    if (document.file_path) {
      console.log('Deleting file from storage:', document.file_path);
      try {
        const { error: storageError } = await supabase.storage
          .from('encrypted-travel-documents')
          .remove([document.file_path]);

        if (storageError) {
          console.error('Storage deletion error (continuing anyway):', storageError);
        } else {
          console.log(`Successfully deleted file from storage: ${document.file_path}`);
        }
      } catch (storageErr) {
        console.error('Exception during storage deletion (continuing anyway):', storageErr);
      }
    } else {
      console.log('No file_path found, skipping storage deletion');
    }

    // Step 4: Delete document record from database using a transaction
    console.log('Deleting document record from database...');
    
    // Usar una transacción RPC para asegurar eliminación atómica
    const { data: deleteResult, error: rpcError } = await supabase
      .rpc('delete_document_safely', { 
        p_document_id: documentId,
        p_user_id: user.id 
      });

    if (rpcError) {
      console.error('RPC deletion error:', rpcError);
      
      // Fallback: intentar eliminación directa
      console.log('Attempting direct deletion as fallback...');
      const { error: directDeleteError } = await supabase
        .from('encrypted_travel_documents')
        .delete()
        .eq('id', documentId)
        .eq('user_id', user.id);

      if (directDeleteError) {
        console.error('Direct deletion also failed:', directDeleteError);
        throw new Error(`Database deletion failed: ${directDeleteError.message}`);
      }
    }

    console.log(`Document successfully deleted from database: ${documentId}`);

    // Note: We don't log the deletion to document_access_log since the document no longer exists
    // and it would violate the foreign key constraint

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