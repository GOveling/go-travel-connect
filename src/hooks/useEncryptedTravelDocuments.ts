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
  notesPreview?: string; // Preview of notes for identification
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

export const useEncryptedTravelDocuments = (autoLoad: boolean = false) => {
  const [documents, setDocuments] = useState<EncryptedTravelDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [isOfflineMode, setIsOfflineMode] = useState(localStorage.getItem('offlineMode') === 'true');
  const { toast } = useToast();
  const { user } = useAuth();

  // Watch for changes in localStorage and manual updates
  useEffect(() => {
    const handleStorageChange = () => {
      const newOfflineMode = localStorage.getItem('offlineMode') === 'true';
      console.log('Storage change detected - new offline mode:', newOfflineMode);
      setIsOfflineMode(newOfflineMode);
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check on initial load
    const currentOfflineMode = localStorage.getItem('offlineMode') === 'true';
    if (currentOfflineMode !== isOfflineMode) {
      console.log('Initial sync - setting offline mode to:', currentOfflineMode);
      setIsOfflineMode(currentOfflineMode);
    }

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Auto-load documents when hook initializes if autoLoad is true or when user/offlineMode changes
  useEffect(() => {
    if (user && (autoLoad || !initialized)) {
      console.log('Auto-loading documents on hook initialization');
      loadDocuments();
    }
  }, [user, isOfflineMode]);

  const loadDocuments = async () => {
    if (!user) {
      console.log('No user found, skipping document load');
      setInitialized(true);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading documents, offline mode:', isOfflineMode);
      
      if (isOfflineMode) {
        // Load from encrypted local storage
        const localDocs = localStorage.getItem('encrypted_travel_documents');
        console.log('Local storage docs found:', !!localDocs, 'Content:', localDocs);
        if (localDocs) {
          const encryptedDocs: LocalEncryptedDocument[] = JSON.parse(localDocs);
          
          // Convert to display format and extract expiry data for offline documents
          const displayDocs: EncryptedTravelDocument[] = await Promise.all(
            encryptedDocs.map(async (doc) => {
              let expiresAt: string | undefined;
              let isExpired = false;
              let expiresInDays: number | undefined;

              // Try to extract expiry date from notes preview or decrypt metadata partially
              try {
                if (doc.notesPreview?.includes('Expira:')) {
                  const expiryMatch = doc.notesPreview.match(/Expira:\s*(\d{4}-\d{2}-\d{2})/);
                  if (expiryMatch) {
                    expiresAt = expiryMatch[1];
                  }
                }
                
                // If no expiry in notes, try to get it from encrypted metadata
                if (!expiresAt) {
                  try {
                    const userPin = localStorage.getItem('travel_app_pin');
                    if (userPin) {
                      const salt = getSalt();
                      const key = await generateLocalKey(userPin, salt);
                      const metadataJson = await decryptLocalData(doc.encryptedMetadata, key);
                      const metadata: TravelDocumentMetadata = JSON.parse(metadataJson);
                      expiresAt = metadata.expiryDate;
                    }
                  } catch (decryptError) {
                    // Silently continue if decryption fails
                    console.log('Could not decrypt metadata for expiry date');
                  }
                }

                // Calculate expiry status
                if (expiresAt) {
                  const today = new Date();
                  const expiry = new Date(expiresAt);
                  if (!isNaN(expiry.getTime())) {
                    const timeDiff = expiry.getTime() - today.getTime();
                    expiresInDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
                    isExpired = expiresInDays < 0;
                  }
                }
              } catch (error) {
                console.log('Error extracting expiry date:', error);
              }

              return {
                id: doc.id,
                documentType: doc.documentType,
                hasFile: doc.hasFile,
                createdAt: doc.createdAt,
                updatedAt: doc.updatedAt,
                accessCount: doc.accessCount,
                lastAccessedAt: doc.lastAccessedAt,
                expiresAt,
                isExpired,
                expiresInDays,
                notesPreview: doc.notesPreview,
              };
            })
          );
          
          console.log('Loaded offline documents:', displayDocs.length);
          setDocuments(displayDocs);
        } else {
          console.log('No offline documents found in localStorage');
          setDocuments([]);
        }
      } else {
        // Load from Supabase with enhanced error handling
        console.log('Loading documents from Supabase...');
        const session = await supabase.auth.getSession();
        console.log('Session status:', !!session.data.session);
        
        if (!session.data.session?.access_token) {
          console.error('No valid session found');
          // Fallback to offline mode temporarily
          localStorage.setItem('offlineMode', 'true');
          setDocuments([]);
          toast({
            title: "Modo offline activado",
            description: "Usando almacenamiento local debido a problemas de autenticación",
            variant: "default",
          });
          return;
        }

        const { data, error } = await supabase.functions.invoke('list-documents', {
          headers: {
            Authorization: `Bearer ${session.data.session.access_token}`,
          },
        });

        console.log('Edge function response:', { success: data?.success, error, dataKeys: Object.keys(data || {}), documentsCount: data?.documents?.length });

        if (error) {
          console.error('Edge function error:', error);
          
          // Check if it's an authentication error
          if (error.message?.includes('auth') || error.message?.includes('401') || error.message?.includes('Unauthorized')) {
            console.log('Authentication error detected, activating offline mode');
            localStorage.setItem('offlineMode', 'true');
            setDocuments([]);
            toast({
              title: "Modo offline activado",
              description: "Problema de autenticación. Usando almacenamiento local",
              variant: "default",
            });
            return;
          }
          
          throw error;
        }

        if (data?.success) {
          console.log('Setting documents from Supabase:', data.documents?.length || 0, 'documents');
          setDocuments(data.documents || []);
        } else {
          console.error('Edge function returned error:', data?.error);
          throw new Error(data?.error || 'Error desconocido del servidor');
        }
      }
    } catch (err: any) {
      console.error('Error loading documents:', err);
      const errorMessage = err.message || 'Error al cargar documentos';
      setError(errorMessage);
      
      // Activate offline mode as fallback for persistent errors
      if (err.message?.includes('auth') || err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        console.log('Activating offline mode due to auth error');
        localStorage.setItem('offlineMode', 'true');
        setDocuments([]);
        toast({
          title: "Modo offline activado",
          description: "Problema de conectividad. Los documentos se cargarán desde el almacenamiento local",
          variant: "default",
        });
      } else {
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
      setInitialized(true);
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
          notesPreview: metadata.expiryDate 
            ? `${metadata.notes || ''} | Expira: ${metadata.expiryDate}`
            : metadata.notes,
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
        // Validate file size before sending (max 2MB after compression)
        if (fileData) {
          const sizeInBytes = (fileData.length * 3) / 4;
          const maxSizeInBytes = 2 * 1024 * 1024; // 2MB
          if (sizeInBytes > maxSizeInBytes) {
            throw new Error('El archivo es demasiado grande. Tamaño máximo: 2MB (las imágenes son comprimidas automáticamente)');
          }
        }

        // Extract only base64 part for server (remove data URL prefix if present)
        const base64Data = fileData?.includes(',') ? fileData.split(',')[1] : fileData;
        
        // Store in Supabase
        const { data, error } = await supabase.functions.invoke('encrypt-document', {
          body: {
            documentType,
            metadata,
            fileData: base64Data, // Send only base64 part
            fileName,
          },
          headers: {
            Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
          },
        });

        if (error) {
          console.error('Error calling encrypt-document function:', error);
          // Handle specific error cases
          if (error.message?.includes('File too large')) {
            throw new Error('El archivo es demasiado grande. Tamaño máximo: 2MB (las imágenes son comprimidas automáticamente)');
          } else if (error.message?.includes('Invalid file format')) {
            throw new Error('Formato de archivo inválido. Selecciona un archivo válido');
          } else if (error.message?.includes('timeout')) {
            throw new Error('Solicitud expiró. Intenta con un archivo más pequeño');
          }
          throw error;
        }

        if (data.success) {
          toast({
            title: "Documento añadido",
            description: "El documento ha sido encriptado y almacenado de forma segura",
            className: "bg-green-50 border-green-200",
          });
        } else {
          // Handle specific error cases from edge function
          let errorMessage = data.error || 'Error al procesar documento';
          if (errorMessage.includes('File too large')) {
            errorMessage = 'El archivo es demasiado grande. Tamaño máximo: 2MB (las imágenes son comprimidas automáticamente)';
          } else if (errorMessage.includes('Invalid file format')) {
            errorMessage = 'Formato de archivo inválido. Selecciona un archivo válido';
          }
          throw new Error(errorMessage);
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
        // Use supabase.functions.invoke instead of fetch for better error handling
        const session = await supabase.auth.getSession();
        if (!session.data.session?.access_token) {
          throw new Error('No hay sesión válida');
        }

        const { data, error } = await supabase.functions.invoke('decrypt-document', {
          body: {
            documentId,
            includeFile
          },
          headers: {
            Authorization: `Bearer ${session.data.session.access_token}`,
          },
        });

        if (error) {
          throw error;
        }

        if (!data.success) {
          throw new Error(data.error || 'Error al desencriptar documento');
        }

        return data.document;
      }
    } catch (err: any) {
      const errorMessage = err.message || 'No se pudo cargar el documento';
      console.error('Error getting document:', err);
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
        // Delete from Supabase using proper invoke method
        const session = await supabase.auth.getSession();
        if (!session.data.session?.access_token) {
          throw new Error('No hay sesión válida');
        }

        const { data, error } = await supabase.functions.invoke('delete-document', {
          body: { documentId },
          headers: {
            Authorization: `Bearer ${session.data.session.access_token}`,
          },
        });

        if (error) {
          throw error;
        }

        if (data.success) {
          toast({
            title: "Documento eliminado",
            description: "El documento ha sido eliminado de forma segura",
            className: "bg-red-50 border-red-200",
          });
        } else {
          throw new Error(data.error || 'Error al eliminar documento');
        }
      }
      
      await loadDocuments();
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Error al eliminar documento';
      console.error('Error deleting document:', err);
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
    if (user && autoLoad && !initialized) {
      loadDocuments();
    } else if (user && !autoLoad) {
      setInitialized(true);
    }
  }, [user, autoLoad, initialized]);

  // Reload documents when mode changes
  useEffect(() => {
    if (user && initialized) {
      loadDocuments();
    }
  }, [isOfflineMode, user, initialized]);

  return {
    documents,
    loading,
    error,
    initialized,
    addDocument,
    getDocument,
    deleteDocument,
    loadDocuments,
    refreshDocuments: loadDocuments,
  };
};