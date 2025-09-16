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

// Helper function to convert ArrayBuffer to base64 without stack overflow
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000; // 32KB chunks to avoid stack overflow
  let binary = '';
  
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.slice(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(binary);
}

// Helper function to convert Uint8Array to base64
function uint8ArrayToBase64(uint8Array: Uint8Array): string {
  const chunkSize = 0x8000; // 32KB chunks
  let binary = '';
  
  for (let i = 0; i < uint8Array.length; i += chunkSize) {
    const chunk = uint8Array.slice(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, Array.from(chunk));
  }
  
  return btoa(binary);
}

// Validate file size (max 2MB for individual files after compression)
function validateFileSize(fileData: string): boolean {
  // Base64 encoding increases size by ~33%, so check original size
  const sizeInBytes = (fileData.length * 3) / 4;
  const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
  return sizeInBytes <= maxSizeInBytes;
}

// Validate Base64 format
function isValidBase64(str: string): boolean {
  try {
    // Handle data URLs by extracting the base64 part
    const base64Part = str.includes(',') ? str.split(',')[1] : str;
    
    // Check if it's valid base64
    if (!base64Part || base64Part.length === 0) return false;
    
    // Validate base64 format
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    if (!base64Regex.test(base64Part)) return false;
    
    // Try to decode and encode to verify
    return btoa(atob(base64Part)) === base64Part;
  } catch (err) {
    console.error('Base64 validation error:', err);
    return false;
  }
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
    encrypted: arrayBufferToBase64(encrypted),
    iv: uint8ArrayToBase64(iv)
  };
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

    // Validate required fields
    if (!documentType || !metadata) {
      throw new Error('Document type and metadata are required');
    }

    // Validate file data if provided
    if (fileData) {
      if (!fileName) {
        throw new Error('File name is required when file data is provided');
      }

      // Validate Base64 format
      if (!isValidBase64(fileData)) {
        console.error('Invalid Base64 format. Data preview:', fileData.substring(0, 100));
        throw new Error('Invalid file format: File must be Base64 encoded');
      }

      // Validate file size (max 2MB after compression)
      if (!validateFileSize(fileData)) {
        throw new Error('File too large: Maximum file size is 2MB (images are automatically compressed)');
      }

      console.log(`Processing file: ${fileName}, size: ${Math.round((fileData.length * 3) / 4 / 1024)} KB`);
    }

    console.log(`Encrypting document for user: ${user.id}, type: ${documentType}`);

    // Generate user-specific encryption key
    const encryptionKey = await generateEncryptionKey(user.id);

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
      // Extract base64 part if it's a data URL
      const base64Data = fileData.includes(',') ? fileData.split(',')[1] : fileData;
      
      const { encrypted: encryptedFile, iv: fileIv } = await encryptData(base64Data, encryptionKey);
      
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