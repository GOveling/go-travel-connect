// Local encryption utilities for offline mode
// Uses Web Crypto API for client-side encryption

export interface EncryptedData {
  data: string;
  iv: string;
  salt: string;
}

export interface LocalEncryptedDocument {
  id: string;
  documentType: string;
  encryptedMetadata: EncryptedData;
  encryptedFileData?: EncryptedData;
  createdAt: string;
  updatedAt: string;
  hasFile: boolean;
  accessCount: number;
  lastAccessedAt?: string;
  notesPreview?: string; // Unencrypted preview of notes for display in list
}

// Generate a key from user password/PIN using PBKDF2
export const generateLocalKey = async (
  userPin: string,
  salt: Uint8Array
): Promise<CryptoKey> => {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(userPin),
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
};

// Encrypt data using AES-GCM
export const encryptLocalData = async (
  data: string,
  key: CryptoKey
): Promise<EncryptedData> => {
  const encoder = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const salt = crypto.getRandomValues(new Uint8Array(16));

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    encoder.encode(data)
  );

  return {
    data: btoa(String.fromCharCode(...new Uint8Array(encrypted))),
    iv: btoa(String.fromCharCode(...iv)),
    salt: btoa(String.fromCharCode(...salt)),
  };
};

// Decrypt data using AES-GCM
export const decryptLocalData = async (
  encryptedData: EncryptedData,
  key: CryptoKey
): Promise<string> => {
  const data = new Uint8Array(
    atob(encryptedData.data)
      .split('')
      .map((char) => char.charCodeAt(0))
  );
  
  const iv = new Uint8Array(
    atob(encryptedData.iv)
      .split('')
      .map((char) => char.charCodeAt(0))
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv },
    key,
    data
  );

  return new TextDecoder().decode(decrypted);
};

// Get or prompt for user PIN
export const getUserPin = (): string | null => {
  let pin = localStorage.getItem('travel_app_pin');
  
  if (!pin) {
    pin = prompt('Ingresa un PIN de 4-8 dígitos para encriptar tus documentos offline:');
    
    if (!pin || pin.length < 4 || pin.length > 8 || !/^\d+$/.test(pin)) {
      alert('PIN inválido. Debe tener entre 4-8 dígitos.');
      return null;
    }
    
    localStorage.setItem('travel_app_pin', pin);
  }
  
  return pin;
};

// Clear PIN (for security)
export const clearUserPin = (): void => {
  localStorage.removeItem('travel_app_pin');
};

// Generate salt for key derivation
export const generateSalt = (): Uint8Array => {
  return crypto.getRandomValues(new Uint8Array(16));
};

// Store salt in localStorage
export const storeSalt = (salt: Uint8Array): void => {
  const saltBase64 = btoa(String.fromCharCode(...salt));
  localStorage.setItem('travel_app_salt', saltBase64);
};

// Retrieve salt from localStorage
export const getSalt = (): Uint8Array => {
  const saltBase64 = localStorage.getItem('travel_app_salt');
  if (!saltBase64) {
    const newSalt = generateSalt();
    storeSalt(newSalt);
    return newSalt;
  }
  
  return new Uint8Array(
    atob(saltBase64)
      .split('')
      .map((char) => char.charCodeAt(0))
  );
};