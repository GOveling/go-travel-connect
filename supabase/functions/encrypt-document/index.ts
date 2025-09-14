import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface EncryptDocumentRequest {
  documentType: string;
  metadata: {
    documentNumber?: string;
    issueDate?: string;
    expiryDate?: string;
    issuingCountry?: string;
    notes?: string;
  };
  fileData?: string; // Base64 encoded file
  fileName?: string;
}

// AES-256-GCM encryption using Web Crypto API
async function generateEncryptionKey(userId: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const salt = encoder.encode(`travel_docs_salt_${userId}`);
  
  // Import user ID as key material
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(userId),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  // Derive AES-256 key
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

async function encryptData(data: string, key: CryptoKey): Promise<{ encrypted: string; iv: string }> {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
  
  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    key,
    encoder.encode(data)
  );
  
  return {
    encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv))
  };
}

async function generateKeyHash(key: CryptoKey): Promise<string> {
  const exported = await crypto.subtle.exportKey("raw", key);
  const hash = await crypto.subtle.digest("SHA-256", exported);
  return btoa(String.fromCharCode(...new Uint8Array(hash)));
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

    // Get user from JWT
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

    const { documentType, metadata, fileData, fileName }: EncryptDocumentRequest = await req.json();

    console.log(`Encrypting document for user: ${user.id}, type: ${documentType}`);

    // Generate user-specific encryption key
    const encryptionKey = await generateEncryptionKey(user.id);
    const keyHash = await generateKeyHash(encryptionKey);

    // Encrypt metadata
    const metadataJson = JSON.stringify(metadata);
    const { encrypted: encryptedMetadata, iv: metadataIv } = await encryptData(metadataJson, encryptionKey);
    
    // Combine encrypted metadata with IV
    const encryptedMetadataWithIv = JSON.stringify({
      data: encryptedMetadata,
      iv: metadataIv
    });

    let filePath = null;

    // Handle file encryption if provided
    if (fileData && fileName) {
      const { encrypted: encryptedFile, iv: fileIv } = await encryptData(fileData, encryptionKey);
      
      // Combine encrypted file with IV
      const encryptedFileWithIv = JSON.stringify({
        data: encryptedFile,
        iv: fileIv
      });

      // Upload encrypted file to storage
      const fileExtension = fileName.split('.').pop() || 'bin';
      const secureFileName = `${user.id}/${crypto.randomUUID()}.${fileExtension}.enc`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('encrypted-travel-documents')
        .upload(secureFileName, encryptedFileWithIv, {
          contentType: 'application/octet-stream',
          cacheControl: '3600'
        });

      if (uploadError) {
        console.error('File upload error:', uploadError);
        throw new Error(`File upload failed: ${uploadError.message}`);
      }

      filePath = uploadData.path;
      console.log(`File encrypted and uploaded: ${filePath}`);
    }

    // Store encrypted document metadata in database
    const { data: document, error: dbError } = await supabase
      .from('encrypted_travel_documents')
      .insert({
        user_id: user.id,
        document_type: documentType,
        encrypted_metadata: encryptedMetadataWithIv,
        file_path: filePath,
        encryption_key_hash: keyHash,
        expires_at: metadata.expiryDate ? new Date(metadata.expiryDate).toISOString() : null
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      throw new Error(`Database error: ${dbError.message}`);
    }

    console.log(`Document encrypted successfully: ${document.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        documentId: document.id,
        message: 'Document encrypted and stored securely'
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error encrypting document:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to encrypt document'
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);