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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    console.log(`Listing documents for user: ${user.id}`);

    // Get user's encrypted documents (metadata only)
    const { data: documents, error: dbError } = await supabase
      .from('encrypted_travel_documents')
      .select(`
        id,
        document_type,
        created_at,
        updated_at,
        expires_at,
        access_count,
        last_accessed_at,
        file_path
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    // Format response with security indicators
    const formattedDocuments = documents.map(doc => ({
      id: doc.id,
      documentType: doc.document_type,
      hasFile: !!doc.file_path,
      createdAt: doc.created_at,
      updatedAt: doc.updated_at,
      expiresAt: doc.expires_at,
      accessCount: doc.access_count,
      lastAccessedAt: doc.last_accessed_at,
      isExpired: doc.expires_at ? new Date(doc.expires_at) < new Date() : false,
      expiresInDays: doc.expires_at ? Math.ceil((new Date(doc.expires_at).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null
    }));

    console.log(`Found ${formattedDocuments.length} documents for user`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        documents: formattedDocuments,
        totalCount: formattedDocuments.length
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error listing documents:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to list documents'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);