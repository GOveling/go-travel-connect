import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

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

  const loadDocuments = async () => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    
    try {
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
        await loadDocuments();
        return true;
      } else {
        throw new Error(data.error);
      }
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
      const { data, error } = await supabase.functions.invoke('decrypt-document', {
        body: {},
        headers: {
          Authorization: `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
        },
      });

      // Use GET parameters for the function
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
        await loadDocuments();
        return true;
      } else {
        throw new Error(data.error);
      }
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