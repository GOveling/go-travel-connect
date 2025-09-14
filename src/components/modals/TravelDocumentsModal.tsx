import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import DocumentForm from "./travel-documents/DocumentForm";
import DocumentCard from "./travel-documents/DocumentCard";
import { Plus, Download, Shield, Lock, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useEncryptedTravelDocuments, TravelDocumentMetadata } from "@/hooks/useEncryptedTravelDocuments";
import { useAuth } from "@/hooks/useAuth";

// Legacy interface for backward compatibility
interface TravelDocument {
  id: string;
  type: string;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  issuingCountry: string;
  notes?: string;
  photo?: string;
}

interface TravelDocumentsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TravelDocumentsModal = ({ isOpen, onClose }: TravelDocumentsModalProps) => {
  const [isOffline, setIsOffline] = useState(false);
  const [isAddingDocument, setIsAddingDocument] = useState(false);
  const [editingDocument, setEditingDocument] = useState<TravelDocument | null>(null);
  const [formData, setFormData] = useState<TravelDocument>({
    id: "",
    type: "",
    documentNumber: "",
    issueDate: "",
    expiryDate: "",
    issuingCountry: "",
    notes: "",
    photo: "",
  });
  const { toast } = useToast();
  const { user } = useAuth();
  const { 
    documents: encryptedDocuments, 
    loading, 
    addDocument, 
    getDocument, 
    deleteDocument,
    refreshDocuments
  } = useEncryptedTravelDocuments();

  // Load offline mode from localStorage (legacy documents are migrated on first use)
  useEffect(() => {
    const savedOfflineMode = localStorage.getItem("offlineMode");
    if (savedOfflineMode) {
      setIsOffline(JSON.parse(savedOfflineMode));
    }
    
    // Migrate legacy documents to encrypted storage on first load
    const legacyDocuments = localStorage.getItem("travelDocuments");
    if (legacyDocuments && user) {
      migrateLegacyDocuments(JSON.parse(legacyDocuments));
    }
  }, [user]);

  // Save offline mode to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("offlineMode", JSON.stringify(isOffline));
  }, [isOffline]);

  const migrateLegacyDocuments = async (legacyDocs: TravelDocument[]) => {
    if (legacyDocs.length === 0) return;
    
    try {
      for (const doc of legacyDocs) {
        const metadata: TravelDocumentMetadata = {
          documentNumber: doc.documentNumber,
          issueDate: doc.issueDate,
          expiryDate: doc.expiryDate,
          issuingCountry: doc.issuingCountry,
          notes: doc.notes,
        };
        
        await addDocument(doc.type, metadata, doc.photo, `document-${doc.id}.jpg`);
      }
      
      // Clear legacy documents after migration
      localStorage.removeItem("travelDocuments");
      
      toast({
        title: "Documentos migrados",
        description: "Tus documentos han sido migrados al sistema de encriptación AES-256",
        className: "bg-green-50 border-green-200",
      });
    } catch (error) {
      console.error("Error migrating legacy documents:", error);
    }
  };

  const handleAddDocument = async () => {
    if (formData.type && formData.documentNumber) {
      const metadata: TravelDocumentMetadata = {
        documentNumber: formData.documentNumber,
        issueDate: formData.issueDate,
        expiryDate: formData.expiryDate,
        issuingCountry: formData.issuingCountry,
        notes: formData.notes,
      };
      
      const success = await addDocument(
        formData.type, 
        metadata, 
        formData.photo, 
        formData.photo ? `document-${Date.now()}.jpg` : undefined
      );
      
      if (success) {
        resetForm();
        setIsAddingDocument(false);
      }
    }
  };

  const handleEditDocument = (document: TravelDocument) => {
    setEditingDocument(document);
    setFormData(document);
    setIsAddingDocument(true);
  };

  const handleUpdateDocument = async () => {
    if (editingDocument) {
      // For encrypted documents, we need to delete and re-add
      await deleteDocument(editingDocument.id);
      await handleAddDocument();
      setEditingDocument(null);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    await deleteDocument(id);
  };

  const resetForm = () => {
    setFormData({
      id: "",
      type: "",
      documentNumber: "",
      issueDate: "",
      expiryDate: "",
      issuingCountry: "",
      notes: "",
      photo: "",
    });
    setIsAddingDocument(false);
    setEditingDocument(null);
  };

  const exportDocuments = async () => {
    if (encryptedDocuments.length === 0) {
      toast({
        title: "Sin documentos",
        description: "No hay documentos para exportar.",
        variant: "destructive",
      });
      return;
    }

    try {
      const exportData = encryptedDocuments.map(doc => ({
        id: doc.id,
        documentType: doc.documentType,
        hasFile: doc.hasFile,
        createdAt: doc.createdAt,
        expiresAt: doc.expiresAt,
        note: "Los documentos están encriptados con AES-256. Use la aplicación para acceder al contenido."
      }));

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `encrypted-travel-documents-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "Documentos exportados",
        description: "La lista de documentos encriptados ha sido exportada (sin contenido sensible).",
      });
    } catch (error) {
      toast({
        title: "Error al exportar",
        description: "No se pudieron exportar los documentos.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <Shield className="w-6 h-6" />
            Documentos de Viaje
            <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800 border-green-300">
              <Lock className="w-3 h-3 mr-1" />
              AES-256 Encriptado
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Security Notice */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-medium text-green-900">Almacenamiento Seguro Militar</h3>
                <p className="text-sm text-green-700 mt-1">
                  Todos tus documentos están protegidos con encriptación AES-256, el mismo estándar usado por bancos y gobiernos.
                  Los datos se almacenan de forma segura y nunca en texto plano.
                </p>
              </div>
            </div>
          </div>

          {/* Offline Mode Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <div>
                <Label className="font-medium">Modo Offline Local</Label>
                <p className="text-sm text-muted-foreground">
                  Usar almacenamiento local con encriptación AES-256 (seguro, sin conexión)
                </p>
              </div>
            </div>
            <Switch
              checked={isOffline}
              onCheckedChange={setIsOffline}
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <Button
              onClick={() => setIsAddingDocument(true)}
              className="flex items-center gap-2"
              disabled={loading}
            >
              <Plus className="w-4 h-4" />
              Añadir Documento
            </Button>

            <Button
              variant="outline"
              onClick={exportDocuments}
              className="flex items-center gap-2"
              disabled={loading || encryptedDocuments.length === 0}
            >
              <Download className="w-4 h-4" />
              Exportar Lista
            </Button>
          </div>

          {/* Document Form */}
          {isAddingDocument && (
            <DocumentForm
              document={formData}
              onDocumentChange={(doc) => setFormData({ ...doc, id: formData.id || crypto.randomUUID() })}
              onSubmit={editingDocument ? handleUpdateDocument : handleAddDocument}
              onCancel={resetForm}
              isEditing={!!editingDocument}
            />
          )}

          {/* Documents List */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 mx-auto mb-4 animate-pulse opacity-50" />
                <p>Cargando documentos encriptados...</p>
              </div>
            ) : encryptedDocuments.length > 0 ? (
              <div className="space-y-3">
                {encryptedDocuments.map((document) => (
                  <div key={document.id} className="relative">
                    <DocumentCard
                      document={{
                        id: document.id,
                        type: document.documentType,
                        documentNumber: "••••••••", // Hidden for security
                        issueDate: "••••••••",
                        expiryDate: document.expiresAt ? new Date(document.expiresAt).toLocaleDateString() : "••••••••",
                        issuingCountry: "••••••••",
                        notes: `Accesos: ${document.accessCount}`,
                        photo: document.hasFile ? "encrypted" : undefined,
                      }}
                      onEdit={() => {}} // Disabled for encrypted documents
                      onDelete={() => handleDeleteDocument(document.id)}
                      isEncrypted={true}
                    />
                    
                    {/* Expiration Warning */}
                    {document.isExpired && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Expirado
                        </Badge>
                      </div>
                    )}
                    
                    {document.expiresInDays !== null && document.expiresInDays <= 30 && document.expiresInDays > 0 && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="outline" className="gap-1 border-orange-300 text-orange-800">
                          <AlertTriangle className="w-3 h-3" />
                          {document.expiresInDays} días
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay documentos añadidos aún</p>
                <p className="text-sm">Añade tu primer documento de viaje encriptado para comenzar</p>
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Lock className="w-4 h-4 inline mr-2 text-green-600" />
                  <span className="text-sm text-green-800">
                    Todos los documentos se almacenan con encriptación AES-256
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TravelDocumentsModal;