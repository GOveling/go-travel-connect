import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Calendar, MapPin, User, Hash, StickyNote, Clock, Shield, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DecryptedDocument } from "@/hooks/useEncryptedTravelDocuments";

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentType: string;
  getDocument: (id: string, includeFile?: boolean) => Promise<DecryptedDocument | null>;
}

const DocumentViewerModal = ({ 
  isOpen, 
  onClose, 
  documentId, 
  documentType, 
  getDocument 
}: DocumentViewerModalProps) => {
  const [document, setDocument] = useState<DecryptedDocument | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && documentId) {
      loadDocument();
    } else {
      setDocument(null);
      setImageError(false);
      setShowFullImage(false);
    }
  }, [isOpen, documentId]);

  const loadDocument = async () => {
    setLoading(true);
    try {
      const decryptedDoc = await getDocument(documentId, true);
      if (decryptedDoc) {
        setDocument(decryptedDoc);
      } else {
        toast({
          title: "Error",
          description: "No se pudo cargar el documento",
          variant: "destructive",
        });
        onClose();
      }
    } catch (error) {
      console.error("Error loading document:", error);
      toast({
        title: "Error de desencriptación",
        description: "No se pudo desencriptar el documento",
        variant: "destructive",
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "No especificada";
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Fecha inválida";
      return date.toLocaleDateString();
    } catch {
      return "Fecha inválida";
    }
  };

  const calculateDaysToExpiry = (expiryDate?: string) => {
    if (!expiryDate) return null;

    try {
      const today = new Date();
      const expiry = new Date(expiryDate);
      if (isNaN(expiry.getTime())) return null;
      
      const timeDiff = expiry.getTime() - today.getTime();
      const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
      return daysDiff;
    } catch {
      return null;
    }
  };

  const getExpiryStatus = (daysToExpiry: number | null) => {
    if (daysToExpiry === null) return null;

    if (daysToExpiry < 0) {
      return {
        status: "expired",
        color: "text-red-600 bg-red-50 border-red-200",
        text: "Expirado",
      };
    } else if (daysToExpiry <= 30) {
      return {
        status: "expiring-soon",
        color: "text-orange-600 bg-orange-50 border-orange-200",
        text: `Expira en ${daysToExpiry} días`,
      };
    } else if (daysToExpiry <= 90) {
      return {
        status: "expires-soon",
        color: "text-yellow-600 bg-yellow-50 border-yellow-200",
        text: `Expira en ${daysToExpiry} días`,
      };
    } else {
      return {
        status: "valid",
        color: "text-green-600 bg-green-50 border-green-200",
        text: `Válido por ${daysToExpiry} días`,
      };
    }
  };

  const daysToExpiry = document?.metadata?.expiryDate ? calculateDaysToExpiry(document.metadata.expiryDate) : null;
  const expiryStatus = getExpiryStatus(daysToExpiry);

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <div>
                <p className="font-medium">Desencriptando documento...</p>
                <p className="text-sm text-muted-foreground">Por favor espera</p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {documentType}
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <Shield className="w-3 h-3 mr-1" />
              Desencriptado
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {document && (
          <div className="space-y-6">
            {/* Expiry Status */}
            {expiryStatus && (
              <div className={`p-3 rounded-lg border ${expiryStatus.color}`}>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span className="font-medium">{expiryStatus.text}</span>
                </div>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {/* Document Image */}
              {document.fileData && (
                <div className="space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Imagen del Documento
                  </h3>
                  <div className="border rounded-lg overflow-hidden">
                    {!imageError ? (
                      <img
                        src={document.fileData}
                        alt="Documento"
                        className="w-full h-auto max-h-96 object-contain bg-gray-50 cursor-pointer hover:opacity-90 transition-opacity"
                        onError={() => setImageError(true)}
                        onClick={() => setShowFullImage(true)}
                        title="Clic para ver en tamaño completo"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <FileText className="w-8 h-8 mx-auto mb-2" />
                          <p>Error al cargar la imagen</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Document Details */}
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Detalles del Documento
                </h3>

                <div className="space-y-3">
                  {document.metadata.documentNumber && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Hash className="w-4 h-4 mt-1 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">Número de Documento</p>
                        <p className="font-medium">{document.metadata.documentNumber}</p>
                      </div>
                    </div>
                  )}

                  {document.metadata.issuingCountry && (
                    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <MapPin className="w-4 h-4 mt-1 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600">País Emisor</p>
                        <p className="font-medium">{document.metadata.issuingCountry}</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <p className="text-sm text-gray-600">Fecha de Emisión</p>
                      </div>
                      <p className="font-medium">{formatDate(document.metadata.issueDate)}</p>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <p className="text-sm text-gray-600">Fecha de Expiración</p>
                      </div>
                      <p className="font-medium">{formatDate(document.metadata.expiryDate)}</p>
                    </div>
                  </div>

                  {document.metadata.notes && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-start gap-2 mb-1">
                        <StickyNote className="w-4 h-4 mt-1 text-gray-600" />
                        <p className="text-sm text-gray-600">Notas</p>
                      </div>
                      <p className="text-sm leading-relaxed">{document.metadata.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Documento Desencriptado Temporalmente</h4>
                  <p className="text-sm text-green-700 mt-1">
                    Este documento ha sido desencriptado solo para visualización. 
                    Se volverá a encriptar automáticamente cuando cierres esta ventana.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </DialogContent>

      {/* Full Image Modal */}
      {showFullImage && document?.fileData && (
        <Dialog open={showFullImage} onOpenChange={setShowFullImage}>
          <DialogContent className="max-w-[95vw] max-h-[95vh] p-2">
            <div className="relative">
              <img
                src={document.fileData}
                alt="Documento - Vista completa"
                className="w-full h-auto max-h-[90vh] object-contain"
              />
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => setShowFullImage(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
};

export default DocumentViewerModal;