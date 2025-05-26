
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { FileText, Plus, Edit, Trash2, Download, Upload, Wifi, WifiOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TravelDocument {
  id: string;
  type: string;
  documentNumber: string;
  issueDate: string;
  expiryDate: string;
  issuingCountry: string;
  notes?: string;
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
    notes: ''
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
    setNewDocument({
      type: '',
      documentNumber: '',
      issueDate: '',
      expiryDate: '',
      issuingCountry: '',
      notes: ''
    });
    setIsAddingDocument(false);
    
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
    setNewDocument({
      type: '',
      documentNumber: '',
      issueDate: '',
      expiryDate: '',
      issuingCountry: '',
      notes: ''
    });
    setIsAddingDocument(false);
    
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

  const documentTypes = [
    'Passport',
    'Visa',
    'Driver\'s License',
    'Travel Insurance',
    'Flight Ticket',
    'Hotel Booking',
    'Vaccination Certificate',
    'Travel Permit',
    'Other'
  ];

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
          <Card className="mb-4">
            <CardHeader>
              <CardTitle>
                {editingDocument ? 'Edit Document' : 'Add New Document'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Document Type *</Label>
                  <select
                    id="type"
                    value={newDocument.type}
                    onChange={(e) => setNewDocument({...newDocument, type: e.target.value})}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select type</option>
                    {documentTypes.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label htmlFor="documentNumber">Document Number *</Label>
                  <Input
                    id="documentNumber"
                    value={newDocument.documentNumber}
                    onChange={(e) => setNewDocument({...newDocument, documentNumber: e.target.value})}
                    placeholder="Enter document number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="issueDate">Issue Date</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={newDocument.issueDate}
                    onChange={(e) => setNewDocument({...newDocument, issueDate: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={newDocument.expiryDate}
                    onChange={(e) => setNewDocument({...newDocument, expiryDate: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="issuingCountry">Issuing Country</Label>
                <Input
                  id="issuingCountry"
                  value={newDocument.issuingCountry}
                  onChange={(e) => setNewDocument({...newDocument, issuingCountry: e.target.value})}
                  placeholder="Enter issuing country"
                />
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={newDocument.notes}
                  onChange={(e) => setNewDocument({...newDocument, notes: e.target.value})}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={editingDocument ? handleUpdateDocument : handleAddDocument}
                >
                  {editingDocument ? 'Update' : 'Add'} Document
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAddingDocument(false);
                    setEditingDocument(null);
                    setNewDocument({
                      type: '',
                      documentNumber: '',
                      issueDate: '',
                      expiryDate: '',
                      issuingCountry: '',
                      notes: ''
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
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
              <Card key={document.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <FileText className="w-4 h-4 text-blue-600" />
                        <h3 className="font-medium">{document.type}</h3>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Document Number</p>
                          <p className="font-medium">{document.documentNumber}</p>
                        </div>
                        
                        {document.issuingCountry && (
                          <div>
                            <p className="text-gray-600">Issuing Country</p>
                            <p className="font-medium">{document.issuingCountry}</p>
                          </div>
                        )}
                        
                        {document.issueDate && (
                          <div>
                            <p className="text-gray-600">Issue Date</p>
                            <p className="font-medium">{new Date(document.issueDate).toLocaleDateString()}</p>
                          </div>
                        )}
                        
                        {document.expiryDate && (
                          <div>
                            <p className="text-gray-600">Expiry Date</p>
                            <p className="font-medium">{new Date(document.expiryDate).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                      
                      {document.notes && (
                        <div className="mt-3">
                          <p className="text-gray-600 text-sm">Notes</p>
                          <p className="text-sm">{document.notes}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditDocument(document)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteDocument(document.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TravelDocumentsModal;
