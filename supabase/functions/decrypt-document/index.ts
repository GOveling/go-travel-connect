import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// AES-256-GCM decryption using Web Crypto API
async function generateEncryptionKey(userId: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const salt = encoder.encode(`travel_docs_salt_${userId}`);
  
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(userId),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

async function decryptData(encryptedWithIv: string, key: CryptoKey): Promise<string> {
  const { data: encryptedData, iv: ivString } = JSON.parse(encryptedWithIv);
  
  const encrypted = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
  const iv = Uint8Array.from(atob(ivString), c => c.charCodeAt(0));
  
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encrypted
  );
  
  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  console.log(`decrypt-document called with method: ${req.method}`);

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

    let documentId: string;
    let includeFile: boolean = false;

    try {
      // Try to parse as JSON first (POST request)
      const body = await req.json();
      documentId = body.documentId || '';
      includeFile = body.includeFile || false;
      console.log('Parsed POST body:', { documentId, includeFile });
    } catch (jsonError) {
      // Fallback to URL parameters (GET request)
      const url = new URL(req.url);
      documentId = url.searchParams.get('documentId') || '';
      includeFile = url.searchParams.get('includeFile') === 'true';
      console.log('Parsed URL params:', { documentId, includeFile });
    }

    if (!documentId) {
      console.error('Document ID is missing');
      throw new Error('Document ID is required');
    }

    console.log(`Decrypting document ${documentId} for user: ${user.id}`);

    // Get encrypted document using maybeSingle to avoid errors
    const { data: document, error: dbError } = await supabase
      .from('encrypted_travel_documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    if (!document) {
      console.log(`Document not found: ${documentId} for user: ${user.id}`);
      throw new Error('Document not found or access denied');
    }

    // Generate user-specific encryption key
    const encryptionKey = await generateEncryptionKey(user.id);

    // Decrypt metadata
    const decryptedMetadata = await decryptData(document.encrypted_metadata, encryptionKey);
    const metadata = JSON.parse(decryptedMetadata);

    let fileData = null;

    // Decrypt file if requested and exists
    if (includeFile && document.file_path) {
      console.log(`Attempting to download file: ${document.file_path}`);
      
      try {
        const { data: encryptedFileData, error: downloadError } = await supabase.storage
          .from('encrypted-travel-documents')
          .download(document.file_path);

        if (downloadError) {
          console.error('File download error:', downloadError);
          console.log('Available files check - file_path from DB:', document.file_path);
          
          // Don't throw error for missing files, just return without fileData
          console.log('File not found in storage, continuing without file data');
          fileData = null;
        } else {
          const encryptedFileText = await encryptedFileData.text();
          const decryptedBase64 = await decryptData(encryptedFileText, encryptionKey);
          
          // Add data URL prefix for images to display properly in the browser
          fileData = `data:image/jpeg;base64,${decryptedBase64}`;
          console.log(`File decrypted successfully`);
        }
      } catch (fileProcessError: any) {
        console.error('File processing error:', fileProcessError);
        console.log('Continuing without file data due to processing error');
        fileData = null;
      }
    }

    // Update access count and last accessed (don't fail if this fails)
    try {
      await supabase
        .from('encrypted_travel_documents')
        .update({
          access_count: document.access_count + 1,
          last_accessed_at: new Date().toISOString()
        })
        .eq('id', documentId);
      console.log('Access count updated successfully');
    } catch (updateError: any) {
      console.error('Failed to update access count:', updateError);
      // Don't fail the request for this
    }

    // Log access (don't fail if this fails)
    try {
      await supabase
        .from('document_access_log')
        .insert({
          user_id: user.id,
          document_id: documentId,
          action_type: 'read',
          success: true,
          access_timestamp: new Date().toISOString()
        });
      console.log('Access logged successfully');
    } catch (logError: any) {
      console.error('Failed to log access:', logError);
      // Don't fail the request for this
    }

    const response = {
      success: true,
      document: {
        id: document.id,
        documentType: document.document_type,
        metadata: metadata,
        fileData: fileData,
        createdAt: document.created_at,
        updatedAt: document.updated_at,
        expiresAt: document.expires_at,
        accessCount: document.access_count + 1,
        lastAccessedAt: new Date().toISOString()
      }
    };

    console.log(`Document decrypted successfully: ${document.id}`);

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error decrypting document:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to decrypt document'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);