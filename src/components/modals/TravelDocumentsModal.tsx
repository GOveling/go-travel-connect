
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { FileText, Plus, Download, Wifi, WifiOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import DocumentForm from "./travel-documents/DocumentForm";
import DocumentCard from "./travel-documents/DocumentCard";

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
  const [documents, setDocuments] = useState<TravelDocument[]>([]);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isAddingDocument, setIsAddingDocument] = useState(false);
  const [editingDocument, setEditingDocument] = useState<TravelDocument | null>(null);
  const [newDocument, setNewDocument] = useState<Omit<TravelDocument, 'id'>>({
    type: '',
    documentNumber: '',
    issueDate: '',
    expiryDate: '',
    issuingCountry: '',
    notes: '',
    photo: ''
  });
  const { toast } = useToast();

  // Load documents from localStorage on component mount
  useEffect(() => {
    const savedDocuments = localStorage.getItem('travelDocuments');
    const savedOfflineMode = localStorage.getItem('offlineMode');
    
    if (savedDocuments) {
      setDocuments(JSON.parse(savedDocuments));
    }
    
    if (savedOfflineMode) {
      setIsOfflineMode(JSON.parse(savedOfflineMode));
    }
  }, []);

  // Save documents to localStorage whenever documents change
  useEffect(() => {
    localStorage.setItem('travelDocuments', JSON.stringify(documents));
  }, [documents]);

  // Save offline mode preference
  useEffect(() => {
    localStorage.setItem('offlineMode', JSON.stringify(isOfflineMode));
  }, [isOfflineMode]);

  const handleAddDocument = () => {
    if (!newDocument.type || !newDocument.documentNumber) {
      toast({
        title: "Error",
        description: "Please fill in required fields",
        variant: "destructive"
      });
      return;
    }

    const document: TravelDocument = {
      ...newDocument,
      id: Date.now().toString()
    };

    setDocuments([...documents, document]);
    resetForm();
    
    toast({
      title: "Success",
      description: "Document added successfully"
    });
  };

  const handleEditDocument = (document: TravelDocument) => {
    setEditingDocument(document);
    setNewDocument(document);
    setIsAddingDocument(true);
  };

  const handleUpdateDocument = () => {
    if (!editingDocument) return;

    const updatedDocuments = documents.map(doc => 
      doc.id === editingDocument.id ? { ...newDocument, id: editingDocument.id } : doc
    );

    setDocuments(updatedDocuments);
    setEditingDocument(null);
    resetForm();
    
    toast({
      title: "Success",
      description: "Document updated successfully"
    });
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(documents.filter(doc => doc.id !== id));
    toast({
      title: "Success",
      description: "Document deleted successfully"
    });
  };

  const resetForm = () => {
    setNewDocument({
      type: '',
      documentNumber: '',
      issueDate: '',
      expiryDate: '',
      issuingCountry: '',
      notes: '',
      photo: ''
    });
    setIsAddingDocument(false);
  };

  const exportDocuments = () => {
    const dataStr = JSON.stringify(documents, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'travel_documents.json';
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Success",
      description: "Documents exported successfully"
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Travel Documents</span>
          </DialogTitle>
        </DialogHeader>

        {/* Offline Mode Toggle */}
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {isOfflineMode ? <WifiOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
                <div>
                  <p className="font-medium">Offline Mode</p>
                  <p className="text-sm text-gray-600">
                    Store documents locally on your device
                  </p>
                </div>
              </div>
              <Switch
                checked={isOfflineMode}
                onCheckedChange={setIsOfflineMode}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-between items-center mb-4">
          <Button
            onClick={() => setIsAddingDocument(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Document</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={exportDocuments}
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </Button>
        </div>

        {/* Add/Edit Document Form */}
        {isAddingDocument && (
          <DocumentForm
            document={newDocument}
            onDocumentChange={setNewDocument}
            onSubmit={editingDocument ? handleUpdateDocument : handleAddDocument}
            onCancel={() => {
              setEditingDocument(null);
              resetForm();
            }}
            isEditing={!!editingDocument}
          />
        )}

        {/* Documents List */}
        <div className="space-y-3">
          {documents.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                <p className="text-gray-600">No documents added yet</p>
                <p className="text-sm text-gray-500">Add your first travel document to get started</p>
              </CardContent>
            </Card>
          ) : (
            documents.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onEdit={handleEditDocument}
                onDelete={handleDeleteDocument}
              />
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TravelDocumentsModal;
