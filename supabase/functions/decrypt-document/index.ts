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
  try {
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
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Failed to decrypt data');
  }
}

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

    // Support both GET and POST requests for better compatibility
    let documentId: string;
    let includeFile: boolean;

    if (req.method === 'GET') {
      const url = new URL(req.url);
      documentId = url.searchParams.get('documentId') || '';
      includeFile = url.searchParams.get('includeFile') === 'true';
    } else {
      const body = await req.json();
      documentId = body.documentId;
      includeFile = body.includeFile === true;
    }

    if (!documentId) {
      throw new Error('Document ID is required');
    }

    console.log(`Decrypting document ${documentId} for user: ${user.id}, includeFile: ${includeFile}`);

    // Get encrypted document with proper error handling
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
      throw new Error('Document not found or access denied');
    }

    // Generate user-specific encryption key
    const encryptionKey = await generateEncryptionKey(user.id);

    // Decrypt metadata
    let metadata: any = {};
    try {
      const decryptedMetadata = await decryptData(document.encrypted_metadata, encryptionKey);
      metadata = JSON.parse(decryptedMetadata);
    } catch (error) {
      console.error('Metadata decryption error:', error);
      throw new Error('Failed to decrypt document metadata');
    }

    let fileData = null;

    // Decrypt file if requested and exists
    if (includeFile && document.file_path) {
      try {
        console.log(`Attempting to download file: ${document.file_path}`);
        
        // Check if file exists first
        const { data: fileList, error: listError } = await supabase.storage
          .from('encrypted-travel-documents')
          .list(document.file_path.split('/').slice(0, -1).join('/'));

        if (listError) {
          console.error('File list error:', listError);
          console.log('Continuing without file data...');
        } else {
          const fileName = document.file_path.split('/').pop();
          const fileExists = fileList?.some(f => f.name === fileName);
          
          if (fileExists) {
            const { data: encryptedFileData, error: downloadError } = await supabase.storage
              .from('encrypted-travel-documents')
              .download(document.file_path);

            if (downloadError) {
              console.error('File download error:', downloadError);
              console.log('Continuing without file data...');
            } else {
              try {
                const encryptedFileText = await encryptedFileData.text();
                const decryptedBase64 = await decryptData(encryptedFileText, encryptionKey);
                
                // Add data URL prefix for images to display properly in the browser
                fileData = `data:image/jpeg;base64,${decryptedBase64}`;
                console.log(`File decrypted successfully`);
              } catch (decryptError) {
                console.error('File decryption error:', decryptError);
                console.log('Continuing without file data...');
              }
            }
          } else {
            console.log(`File ${fileName} not found in storage, continuing without file data...`);
          }
        }
      } catch (fileError) {
        console.error('File processing error:', fileError);
        console.log('Continuing without file data...');
      }
    }

    // Try to update access count and last accessed (non-critical)
    try {
      await supabase
        .from('encrypted_travel_documents')
        .update({
          access_count: (document.access_count || 0) + 1,
          last_accessed_at: new Date().toISOString()
        })
        .eq('id', documentId);
    } catch (updateError) {
      console.error('Error updating access count (non-critical):', updateError);
    }

    // Try to log access (non-critical)
    try {
      await supabase
        .from('document_access_log')
        .insert({
          user_id: user.id,
          document_id: documentId,
          action_type: 'read',
          success: true
        });
    } catch (logError) {
      console.error('Error logging access (non-critical):', logError);
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
        accessCount: (document.access_count || 0) + 1,
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