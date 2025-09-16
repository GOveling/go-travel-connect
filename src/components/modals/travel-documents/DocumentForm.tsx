import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  JollyRangeCalendar,
  JollyCalendar,
} from "@/components/ui/range-calendar";
import {
  parseDate,
  getLocalTimeZone,
  today,
  CalendarDate,
} from "@internationalized/date";
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
  document: Omit<TravelDocument, "id">;
  onDocumentChange: (document: Omit<TravelDocument, "id">) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEditing: boolean;
}

const DocumentForm = ({
  document,
  onDocumentChange,
  onSubmit,
  onCancel,
  isEditing,
}: DocumentFormProps) => {
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [isIssueDateOpen, setIsIssueDateOpen] = useState(false);

  const documentTypes = [
    "Passport",
    "Visa",
    "Driver's License",
    "Travel Insurance",
    "Flight Ticket",
    "Hotel Booking",
    "Vaccination Certificate",
    "Travel Permit",
    "Other",
  ];

  const handleDateRangeChange = (
    range: { start: CalendarDate | null; end: CalendarDate | null } | null
  ) => {
    if (range?.start && range?.end) {
      // Use string formatting to preserve exact date without timezone issues
      const issueDate = `${range.start.year}-${String(range.start.month).padStart(2, '0')}-${String(range.start.day).padStart(2, '0')}`;
      const expiryDate = `${range.end.year}-${String(range.end.month).padStart(2, '0')}-${String(range.end.day).padStart(2, '0')}`;
      onDocumentChange({
        ...document,
        issueDate,
        expiryDate,
      });
      setIsDateRangeOpen(false);
    }
  };

  const handleIssueDateChange = (date: CalendarDate | null) => {
    if (date) {
      // Use string formatting to preserve exact date without timezone issues
      const issueDate = `${date.year}-${String(date.month).padStart(2, '0')}-${String(date.day).padStart(2, '0')}`;
      onDocumentChange({
        ...document,
        issueDate,
      });
      setIsIssueDateOpen(false);
    }
  };

  const getDateRangeValue = () => {
    if (document.issueDate && document.expiryDate) {
      return {
        start: parseDate(document.issueDate),
        end: parseDate(document.expiryDate),
      };
    }
    return null;
  };

  const getIssueDateValue = () => {
    if (document.issueDate) {
      return parseDate(document.issueDate);
    }
    return null;
  };

  const formatDateRange = () => {
    if (document.issueDate && document.expiryDate) {
      return `${format(new Date(document.issueDate), "dd/MM/yyyy")} - ${format(new Date(document.expiryDate), "dd/MM/yyyy")}`;
    }
    return "Seleccionar período de validez";
  };

  const formatIssueDate = () => {
    if (document.issueDate) {
      return format(new Date(document.issueDate), "dd/MM/yyyy");
    }
    return "Seleccionar fecha de emisión";
  };

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>
          {isEditing ? "Edit Document" : "Add New Document"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="type">Document Type *</Label>
            <select
              id="type"
              value={document.type}
              onChange={(e) =>
                onDocumentChange({ ...document, type: e.target.value })
              }
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select type</option>
              {documentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <Label htmlFor="documentNumber">Document Number *</Label>
            <Input
              id="documentNumber"
              value={document.documentNumber}
              onChange={(e) =>
                onDocumentChange({
                  ...document,
                  documentNumber: e.target.value,
                })
              }
              placeholder="Enter document number"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Fecha de Emisión</Label>
            <Popover open={isIssueDateOpen} onOpenChange={setIsIssueDateOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !document.issueDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formatIssueDate()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <JollyCalendar
                  value={getIssueDateValue()}
                  onChange={handleIssueDateChange}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <Label>Período de Validez (Emisión - Vencimiento)</Label>
            <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    (!document.issueDate || !document.expiryDate) &&
                      "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formatDateRange()}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <JollyRangeCalendar
                  value={getDateRangeValue()}
                  onChange={handleDateRangeChange}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div>
          <Label htmlFor="issuingCountry">Issuing Country</Label>
          <Input
            id="issuingCountry"
            value={document.issuingCountry}
            onChange={(e) =>
              onDocumentChange({ ...document, issuingCountry: e.target.value })
            }
            placeholder="Enter issuing country"
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={document.notes}
            onChange={(e) =>
              onDocumentChange({ ...document, notes: e.target.value })
            }
            placeholder="Additional notes..."
            rows={3}
          />
        </div>

        <PhotoUpload
          photo={document.photo || ""}
          onPhotoChange={(photo) => onDocumentChange({ ...document, photo })}
        />

        <div className="flex space-x-2">
          <Button onClick={onSubmit}>
            {isEditing ? "Update" : "Add"} Document
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
