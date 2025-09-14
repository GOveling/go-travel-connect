import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import {
  encryptLocalData,
  decryptLocalData,
  generateLocalKey,
  getUserPin,
  getSalt,
  type LocalEncryptedDocument,
  type EncryptedData
} from "@/utils/localEncryption";

export interface EncryptedTravelDocument {
  id: string;
  documentType: string;
  hasFile: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  accessCount: number;
  lastAccessedAt?: string;
  isExpired: boolean;
  expiresInDays?: number;
}

export interface TravelDocumentMetadata {
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  issuingCountry?: string;
  notes?: string;
}

export interface DecryptedDocument {
  id: string;
  documentType: string;
  metadata: TravelDocumentMetadata;
  fileData?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  accessCount: number;
  lastAccessedAt: string;
}

export const useEncryptedTravelDocuments = () => {
  const [documents, setDocuments] = useState<EncryptedTravelDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Check if in offline mode
  const isOfflineMode = localStorage.getItem('offlineMode') === 'true';

  const loadDocuments = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
      if (isOfflineMode) {
        // Load from encrypted local storage
        const localDocs = localStorage.getItem('encrypted_travel_documents');
        if (localDocs) {
          const encryptedDocs: LocalEncryptedDocument[] = JSON.parse(localDocs);
          
          // Convert to display format without decrypting
          const displayDocs: EncryptedTravelDocument[] = encryptedDocs.map(doc => ({
            id: doc.id,
            documentType: doc.documentType,
            hasFile: doc.hasFile,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
            accessCount: doc.accessCount,
            lastAccessedAt: doc.lastAccessedAt,
            isExpired: false,
            expiresInDays: undefined,
          }));
          
          setDocuments(displayDocs);
        } else {
          setDocuments([]);
        }
      } else {
        // Load from Supabase
        const { data, error } = await supabase.functions.invoke('list-documents', {
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
        });

        if (error) throw error;

        if (data.success) {
          setDocuments(data.documents);
        } else {
          throw new Error(data.error);
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al cargar documentos';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addDocument = async (
    documentType: string,
    metadata: TravelDocumentMetadata,
    fileData?: string,
    fileName?: string
  ): Promise<boolean> => {
    if (!user) return false;
    
    setLoading(true);
    
    try {
      if (isOfflineMode) {
        // Encrypt and store locally
        const userPin = getUserPin();
        if (!userPin) {
          throw new Error('PIN requerido para encriptación local');
        }

        const salt = getSalt();
        const key = await generateLocalKey(userPin, salt);
        
        // Encrypt metadata
        const encryptedMetadata = await encryptLocalData(JSON.stringify(metadata), key);
        
        // Encrypt file data if provided
        let encryptedFileData: EncryptedData | undefined;
        if (fileData) {
          encryptedFileData = await encryptLocalData(fileData, key);
        }

        // Create local encrypted document
        const localDoc: LocalEncryptedDocument = {
          id: crypto.randomUUID(),
          documentType,
          encryptedMetadata,
          encryptedFileData,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          hasFile: !!fileData,
          accessCount: 0,
        };

        // Store in localStorage
        const existingDocs = localStorage.getItem('encrypted_travel_documents');
        const docs: LocalEncryptedDocument[] = existingDocs ? JSON.parse(existingDocs) : [];
        docs.push(localDoc);
        localStorage.setItem('encrypted_travel_documents', JSON.stringify(docs));

        toast({
          title: "Documento añadido",
          description: "El documento ha sido encriptado y almacenado localmente de forma segura",
          className: "bg-green-50 border-green-200",
        });
      } else {
        // Store in Supabase
        const { data, error } = await supabase.functions.invoke('encrypt-document', {
          body: {
            documentType,
            metadata,
            fileData,
            fileName,
          },
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
        });

        if (error) throw error;

        if (data.success) {
          toast({
            title: "Documento añadido",
            description: "El documento ha sido encriptado y almacenado de forma segura",
            className: "bg-green-50 border-green-200",
          });
        } else {
          throw new Error(data.error);
        }
      }
      
      await loadDocuments();
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al añadir documento';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getDocument = async (documentId: string, includeFile: boolean = false): Promise<DecryptedDocument | null> => {
    if (!user) return null;
    
    try {
      if (isOfflineMode) {
        // Decrypt from local storage
        const userPin = getUserPin();
        if (!userPin) {
          throw new Error('PIN requerido para desencriptar documento local');
        }

        const salt = getSalt();
        const key = await generateLocalKey(userPin, salt);
        
        const localDocs = localStorage.getItem('encrypted_travel_documents');
        if (!localDocs) {
          throw new Error('No se encontraron documentos locales');
        }

        const docs: LocalEncryptedDocument[] = JSON.parse(localDocs);
        const doc = docs.find(d => d.id === documentId);
        
        if (!doc) {
          throw new Error('Documento no encontrado');
        }

        // Decrypt metadata
        const metadataJson = await decryptLocalData(doc.encryptedMetadata, key);
        const metadata: TravelDocumentMetadata = JSON.parse(metadataJson);

        // Decrypt file data if requested and available
        let fileData: string | undefined;
        if (includeFile && doc.encryptedFileData) {
          fileData = await decryptLocalData(doc.encryptedFileData, key);
        }

        // Update access count
        doc.accessCount += 1;
        doc.lastAccessedAt = new Date().toISOString();
        
        const updatedDocs = docs.map(d => d.id === documentId ? doc : d);
        localStorage.setItem('encrypted_travel_documents', JSON.stringify(updatedDocs));

        return {
          id: doc.id,
          documentType: doc.documentType,
          metadata,
          fileData,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
          accessCount: doc.accessCount,
          lastAccessedAt: doc.lastAccessedAt || new Date().toISOString(),
        };
      } else {
        // Decrypt from Supabase
        const url = new URL(`https://suhttfxcurgurshlkcpz.supabase.co/functions/v1/decrypt-document`);
        url.searchParams.set('documentId', documentId);
        url.searchParams.set('includeFile', includeFile.toString());

        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        const result = await response.json();

        if (!result.success) {
          throw new Error(result.error);
        }

        return result.document;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Error al obtener documento';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteDocument = async (documentId: string): Promise<boolean> => {
    if (!user) return false;
    
    setLoading(true);
    
    try {
      if (isOfflineMode) {
        // Delete from local storage
        const localDocs = localStorage.getItem('encrypted_travel_documents');
        if (!localDocs) {
          throw new Error('No se encontraron documentos locales');
        }

        const docs: LocalEncryptedDocument[] = JSON.parse(localDocs);
        const filteredDocs = docs.filter(d => d.id !== documentId);
        
        if (docs.length === filteredDocs.length) {
          throw new Error('Documento no encontrado');
        }

        localStorage.setItem('encrypted_travel_documents', JSON.stringify(filteredDocs));

        toast({
          title: "Documento eliminado",
          description: "El documento ha sido eliminado de forma segura del almacenamiento local",
          className: "bg-red-50 border-red-200",
        });
      } else {
        // Delete from Supabase
        const { data, error } = await supabase.functions.invoke('delete-document', {
          body: { documentId },
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
        });

        if (error) throw error;

        if (data.success) {
          toast({
            title: "Documento eliminado",
            description: "El documento ha sido eliminado de forma segura",
            className: "bg-red-50 border-red-200",
          });
        } else {
          throw new Error(data.error);
        }
      }
      
      await loadDocuments();
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al eliminar documento';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadDocuments();
    }
  }, [user]);

  return {
    documents,
    loading,
    error,
    addDocument,
    getDocument,
    deleteDocument,
    refreshDocuments: loadDocuments,
  };
};