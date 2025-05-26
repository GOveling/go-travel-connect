
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import PhotoUpload from "./PhotoUpload";

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

interface DocumentFormProps {
  document: Omit<TravelDocument, 'id'>;
  onDocumentChange: (document: Omit<TravelDocument, 'id'>) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEditing: boolean;
}

const DocumentForm = ({ document, onDocumentChange, onSubmit, onCancel, isEditing }: DocumentFormProps) => {
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
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>
          {isEditing ? 'Edit Document' : 'Add New Document'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="type">Document Type *</Label>
            <select
              id="type"
              value={document.type}
              onChange={(e) => onDocumentChange({...document, type: e.target.value})}
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
              value={document.documentNumber}
              onChange={(e) => onDocumentChange({...document, documentNumber: e.target.value})}
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
              value={document.issueDate}
              onChange={(e) => onDocumentChange({...document, issueDate: e.target.value})}
            />
          </div>
          
          <div>
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <Input
              id="expiryDate"
              type="date"
              value={document.expiryDate}
              onChange={(e) => onDocumentChange({...document, expiryDate: e.target.value})}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="issuingCountry">Issuing Country</Label>
          <Input
            id="issuingCountry"
            value={document.issuingCountry}
            onChange={(e) => onDocumentChange({...document, issuingCountry: e.target.value})}
            placeholder="Enter issuing country"
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={document.notes}
            onChange={(e) => onDocumentChange({...document, notes: e.target.value})}
            placeholder="Additional notes..."
            rows={3}
          />
        </div>

        <PhotoUpload
          photo={document.photo || ''}
          onPhotoChange={(photo) => onDocumentChange({...document, photo})}
        />

        <div className="flex space-x-2">
          <Button onClick={onSubmit}>
            {isEditing ? 'Update' : 'Add'} Document
          </Button>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DocumentForm;
