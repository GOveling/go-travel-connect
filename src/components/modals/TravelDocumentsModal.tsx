import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import DocumentForm from "./travel-documents/DocumentForm";
import DocumentCard from "./travel-documents/DocumentCard";
import DocumentViewerModal from "./travel-documents/DocumentViewerModal";
import { Plus, Download, Shield, Lock, AlertTriangle, RefreshCw, CloudUpload, HardDrive, ArrowLeftRight, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEncryptedTravelDocuments, TravelDocumentMetadata } from "@/hooks/useEncryptedTravelDocuments";
import { useAuth } from "@/hooks/useAuth";
import { getUserPin, clearUserPin, setUserPin } from "@/utils/localEncryption";
import PinRecoveryModal from "./travel-documents/PinRecoveryModal";

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
  const [viewingDocumentId, setViewingDocumentId] = useState<string | null>(null);
  const [viewingDocumentType, setViewingDocumentType] = useState<string>("");
  const [showSyncOptions, setShowSyncOptions] = useState(false);
  const [showPinRecovery, setShowPinRecovery] = useState(false);
  const [onlineDocuments, setOnlineDocuments] = useState<any[]>([]);
  const [offlineDocuments, setOfflineDocuments] = useState<any[]>([]);
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
  
  // Use the hook with autoLoad enabled when modal is open
  const {
    documents: currentDocuments,
    loading,
    initialized,
    addDocument,
    getDocument,
    deleteDocument,
    loadDocuments,
    refreshDocuments
  } = useEncryptedTravelDocuments(isOpen && !!user);

  // Load documents when modal opens or mode changes
  useEffect(() => {
    if (isOpen && user) {
      console.log('Modal effect triggered - loading documents with offline mode:', isOffline);
      // Sync the localStorage with the current offline state before loading
      localStorage.setItem("offlineMode", isOffline.toString());
      loadDocuments();
      loadDocumentCounts();
    }
  }, [isOpen, user, isOffline]);

  const loadDocumentCounts = async () => {
    try {
      console.log('Loading document counts...');
      // Get counts from localStorage for quick display
      const offlineData = localStorage.getItem('encrypted_travel_documents');
      const offlineDocs = offlineData ? JSON.parse(offlineData) : [];
      console.log('Offline docs count:', offlineDocs.length);
      setOfflineDocuments(offlineDocs);
      
      // For online count, we'll use the current hook state when online
      if (!isOffline) {
        console.log('Online docs count:', currentDocuments.length);
        setOnlineDocuments(currentDocuments);
      } else {
        console.log('In offline mode, not updating online count');
      }
    } catch (error) {
      console.error('Error loading document counts:', error);
    }
  };

  // Update counts when documents change
  useEffect(() => {
    if (initialized) {
      console.log('Documents updated, refreshing counts. Current docs:', currentDocuments.length);
      loadDocumentCounts();
    }
  }, [currentDocuments, initialized]);

  // Load offline mode from localStorage and sync with hook
  useEffect(() => {
    const savedOfflineMode = localStorage.getItem("offlineMode");
    const offlineMode = savedOfflineMode ? JSON.parse(savedOfflineMode) : false;
    setIsOffline(offlineMode);
    console.log('Modal initialized with offline mode:', offlineMode);
    
    // Migrate legacy documents to encrypted storage on first load
    const legacyDocuments = localStorage.getItem("travelDocuments");
    if (legacyDocuments && user && isOpen) {
      migrateLegacyDocuments(JSON.parse(legacyDocuments));
    }
  }, [user, isOpen]);

  // Sync localStorage when offline state changes
  useEffect(() => {
    localStorage.setItem("offlineMode", isOffline.toString());
    console.log('Offline mode changed to:', isOffline);
    // Trigger storage event for the hook to pick up the change
    window.dispatchEvent(new Event('storage'));
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
        loadDocumentCounts(); // Reload counts
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
    try {
      const success = await deleteDocument(id);
      
      if (success !== false) {
        await loadDocuments();
        loadDocumentCounts(); // Reload counts
        
        if (viewingDocumentId === id) {
          handleCloseViewer();
        }
      }
      
      return success;
    } catch (error) {
      console.error("Error deleting document:", error);
      throw error;
    }
  };

  const syncDocumentsBetweenModes = async (fromOfflineToOnline: boolean) => {
    toast({
      title: "Función de sincronización",
      description: "Esta funcionalidad estará disponible próximamente",
      variant: "default",
    });
  };

  const handleViewDocument = (document: TravelDocument) => {
    setViewingDocumentId(document.id);
    setViewingDocumentType(document.type);
  };

  const handleCloseViewer = () => {
    setViewingDocumentId(null);
    setViewingDocumentType("");
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
    if (currentDocuments.length === 0) {
      toast({
        title: "Sin documentos",
        description: "No hay documentos para exportar.",
        variant: "destructive",
      });
      return;
    }

    try {
      const exportData = currentDocuments.map(doc => ({
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

  const handleOfflineToggle = async (checked: boolean) => {
    if (checked) {
      // Activating offline mode - request PIN
      await requestOfflinePin();
    } else {
      // Deactivating offline mode
      setIsOffline(false);
      localStorage.setItem("offlineMode", "false");
      
      // Force reload documents in online mode
      await refreshDocuments();
      
      toast({
        title: "Modo online activado",
        description: "Los documentos se almacenarán en la nube encriptados",
        className: "bg-blue-50 border-blue-200",
      });
    }
  };

  const requestOfflinePin = async () => {
    // Check if PIN already exists
    const existingPin = localStorage.getItem('travel_app_pin');
    
    if (existingPin) {
      // PIN exists, just verify it
      const enteredPin = prompt('Ingresa tu PIN de 4 dígitos para activar el modo offline:');
      
      if (!enteredPin || enteredPin !== existingPin) {
        toast({
          title: "PIN incorrecto",
          description: "El PIN ingresado no es correcto",
          variant: "destructive",
        });
        return;
      }
      
      // PIN verified, activate offline mode
      setIsOffline(true);
      localStorage.setItem("offlineMode", "true");
      await refreshDocuments();
      
      toast({
        title: "Modo offline activado",
        description: "Los documentos se almacenarán localmente de forma segura",
        className: "bg-green-50 border-green-200",
      });
    } else {
      // No PIN exists, create a new one
      const newPin = prompt('Crea un PIN de 4 dígitos para proteger tus documentos offline:');
      
      if (!newPin || newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
        toast({
          title: "PIN inválido",
          description: "El PIN debe tener exactamente 4 dígitos",
          variant: "destructive",
        });
        return;
      }
      
      // Confirm PIN
      const confirmPin = prompt('Confirma tu PIN de 4 dígitos:');
      
      if (confirmPin !== newPin) {
        toast({
          title: "PIN no coincide",
          description: "Los PINs ingresados no coinciden",
          variant: "destructive",
        });
        return;
      }
      
      // Save PIN and activate offline mode
      try {
        setUserPin(newPin);
        setIsOffline(true);
        localStorage.setItem("offlineMode", "true");
        await refreshDocuments();
        
        toast({
          title: "Modo offline activado",
          description: "PIN configurado correctamente. Los documentos se almacenarán localmente de forma segura",
          className: "bg-green-50 border-green-200",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Error al configurar PIN",
          variant: "destructive",
        });
      }
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

          {/* Mode Selection and Status */}
          <div className="space-y-4">
            {/* Current Mode Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 ${isOffline ? 'bg-blue-500' : 'bg-green-500'} rounded-full animate-pulse`}></div>
                <div>
                  <div className="flex items-center gap-2">
                    <Label className="font-medium">Modo de Almacenamiento</Label>
                    {isOffline ? <HardDrive className="w-4 h-4 text-blue-600" /> : <CloudUpload className="w-4 h-4 text-green-600" />}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {isOffline 
                      ? "Almacenamiento local con encriptación AES-256 (sin conexión)" 
                      : "Almacenamiento en la nube con encriptación AES-256 (requiere conexión)"
                    }
                  </p>
                </div>
              </div>
              <Switch
                checked={isOffline}
                onCheckedChange={handleOfflineToggle}
              />
            </div>

            {/* Document Count Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
                <div className="flex items-center gap-2">
                  <CloudUpload className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium">Online</span>
                </div>
                <Badge variant={isOffline ? "secondary" : "default"} className="bg-green-100 text-green-800">
                  {onlineDocuments.length} docs
                </Badge>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium">Offline</span>
                </div>
                <Badge variant={!isOffline ? "secondary" : "default"} className="bg-blue-100 text-blue-800">
                  {offlineDocuments.length} docs
                </Badge>
              </div>
            </div>

            {/* Mode Separation Warning */}
            {(onlineDocuments.length > 0 && offlineDocuments.length > 0) && (
              <Alert className="border-amber-200 bg-amber-50">
                <Info className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  Tienes documentos en ambos modos. Los documentos online y offline están separados.
                  <Button 
                    variant="link" 
                    className="h-auto p-0 ml-1 text-amber-700 underline"
                    onClick={() => setShowSyncOptions(!showSyncOptions)}
                  >
                    Ver opciones de sincronización
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Sync Options */}
            {showSyncOptions && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                <div className="flex items-center gap-2 mb-3">
                  <ArrowLeftRight className="w-4 h-4 text-blue-600" />
                  <span className="font-medium text-blue-900">Opciones de Sincronización</span>
                </div>
                
                {offlineDocuments.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => syncDocumentsBetweenModes(true)}
                    className="w-full justify-start"
                  >
                    <HardDrive className="w-4 h-4 mr-2" />
                    Mover {offlineDocuments.length} documento(s) offline → online
                  </Button>
                )}
                
                {onlineDocuments.length > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => syncDocumentsBetweenModes(false)}
                    className="w-full justify-start"
                  >
                    <CloudUpload className="w-4 h-4 mr-2" />
                    Mover {onlineDocuments.length} documento(s) online → offline
                  </Button>
                )}
                
                <p className="text-xs text-blue-700">
                  ⚠️ Los documentos se moverán completamente al modo seleccionado
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-start items-center">
            <Button
              onClick={() => setIsAddingDocument(true)}
              className="flex items-center gap-2"
              disabled={loading}
            >
              <Plus className="w-4 h-4" />
              Añadir Documento
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
            {/* Debug info */}
            <div className="text-xs text-gray-500 p-2 bg-gray-50 rounded">
              Documentos: {currentDocuments.length} | Cargando: {loading ? 'Sí' : 'No'} | Inicializado: {initialized ? 'Sí' : 'No'}
            </div>
            
            {loading ? (
              <div className="text-center py-8">
                <Shield className="w-12 h-12 mx-auto mb-4 animate-pulse opacity-50" />
                <p>Cargando documentos encriptados...</p>
              </div>
            ) : currentDocuments.length > 0 ? (
              <div className="space-y-3">
                {currentDocuments.map((document) => (
                  <div key={document.id} className="relative">
                    <DocumentCard
                      document={{
                        id: document.id,
                        type: document.documentType,
                        documentNumber: "••••••••", // Hidden for security
                        issueDate: "••••••••",
                        expiryDate: document.expiresAt || "••••••••",
                        issuingCountry: "••••••••",
                        notes: document.notesPreview || `Documento creado el ${new Date(document.createdAt).toLocaleDateString()}`,
                        photo: document.hasFile ? "encrypted" : undefined,
                      }}
                      onEdit={() => {}} // Disabled for encrypted documents
                      onDelete={() => handleDeleteDocument(document.id)}
                      onView={handleViewDocument}
                      isEncrypted={true}
                      storageMode={isOffline ? 'offline' : 'online'}
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
                    
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No hay documentos añadidos aún</p>
                <p className="text-sm">Añade tu primer documento de viaje encriptado para comenzar</p>
                
                {/* Manual reload button */}
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    console.log('Manual reload triggered');
                    refreshDocuments();
                  }}
                  className="mt-4"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Recargar documentos
                </Button>
                
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

      {/* Document Viewer Modal */}
      {viewingDocumentId && (
        <DocumentViewerModal
          isOpen={!!viewingDocumentId}
          onClose={handleCloseViewer}
          documentId={viewingDocumentId}
          documentType={viewingDocumentType}
          getDocument={getDocument}
          onDelete={handleDeleteDocument}
          storageMode={isOffline ? 'offline' : 'online'}
        />
      )}
      {/* PIN Recovery Modal */}
      <PinRecoveryModal 
        isOpen={showPinRecovery}
        onClose={() => setShowPinRecovery(false)}
      />
    </Dialog>
  );
};

export default TravelDocumentsModal;