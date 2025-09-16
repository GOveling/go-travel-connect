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

  console.log(`delete-document called with method: ${req.method}`);

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('No authorization header provided');
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError) {
      console.error('Auth error:', authError);
      throw new Error(`Authentication failed: ${authError.message}`);
    }

    if (!user) {
      console.error('No user found in token');
      throw new Error('User not found');
    }

    const { documentId } = await req.json();

    if (!documentId) {
      console.error('Document ID is missing');
      throw new Error('Document ID is required');
    }

    console.log(`Deleting document ${documentId} for user: ${user.id}`);

    // Get document info first using maybeSingle to avoid errors
    const { data: document, error: getError } = await supabase
      .from('encrypted_travel_documents')
      .select('file_path')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (getError) {
      console.error('Database error:', getError);
      throw new Error(`Database error: ${getError.message}`);
    }

    if (!document) {
      console.log(`Document not found: ${documentId} for user: ${user.id}`);
      throw new Error('Document not found or access denied');
    }

    // Delete file from storage if exists
    if (document.file_path) {
      const { error: storageError } = await supabase.storage
        .from('encrypted-travel-documents')
        .remove([document.file_path]);

      if (storageError) {
        console.error('Storage deletion error:', storageError);
        // Continue with database deletion even if file deletion fails
      } else {
        console.log(`File deleted from storage: ${document.file_path}`);
      }
    }

    // Delete document record from database
    const { error: deleteError } = await supabase
      .from('encrypted_travel_documents')
      .delete()
      .eq('id', documentId)
      .eq('user_id', user.id);

    if (deleteError) {
      console.error('Database deletion error:', deleteError);
      throw new Error(`Database deletion failed: ${deleteError.message}`);
    }

    console.log(`Document deleted successfully: ${documentId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Document deleted securely'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error deleting document:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to delete document'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);