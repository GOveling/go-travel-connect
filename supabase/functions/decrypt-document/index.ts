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

    const url = new URL(req.url);
    const documentId = url.searchParams.get('documentId');
    const includeFile = url.searchParams.get('includeFile') === 'true';

    if (!documentId) {
      throw new Error('Document ID is required');
    }

    console.log(`Decrypting document ${documentId} for user: ${user.id}`);

    // Get encrypted document
    const { data: document, error: dbError } = await supabase
      .from('encrypted_travel_documents')
      .select('*')
      .eq('id', documentId)
      .eq('user_id', user.id)
      .single();

    if (dbError || !document) {
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
      const { data: encryptedFileData, error: downloadError } = await supabase.storage
        .from('encrypted-travel-documents')
        .download(document.file_path);

      if (downloadError) {
        console.error('File download error:', downloadError);
        throw new Error(`File download failed: ${downloadError.message}`);
      }

      const encryptedFileText = await encryptedFileData.text();
      const decryptedBase64 = await decryptData(encryptedFileText, encryptionKey);
      
      // Add data URL prefix for images to display properly in the browser
      fileData = `data:image/jpeg;base64,${decryptedBase64}`;
      console.log(`File decrypted successfully`);
    }

    // Update access count and last accessed
    await supabase
      .from('encrypted_travel_documents')
      .update({
        access_count: document.access_count + 1,
        last_accessed_at: new Date().toISOString()
      })
      .eq('id', documentId);

    // Log access
    await supabase
      .from('document_access_log')
      .insert({
        user_id: user.id,
        document_id: documentId,
        action_type: 'read',
        success: true
      });

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