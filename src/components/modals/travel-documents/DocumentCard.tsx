import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Edit, Trash2, AlertTriangle, Clock, Lock } from "lucide-react";

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

interface DocumentCardProps {
  document: TravelDocument;
  onEdit: (document: TravelDocument) => void;
  onDelete: (id: string) => void;
  onView?: (document: TravelDocument) => void;
  isEncrypted?: boolean;
}

const DocumentCard = ({ document, onEdit, onDelete, onView, isEncrypted = false }: DocumentCardProps) => {
  const calculateDaysToExpiry = (expiryDate: string) => {
    if (!expiryDate || expiryDate === "••••••••") return null;

    try {
      const today = new Date();
      const expiry = new Date(expiryDate);
      
      // Check if date is valid
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
        color: "text-red-600",
        bgColor: "bg-red-50",
        text: "Expired",
      };
    } else if (daysToExpiry <= 30) {
      return {
        status: "expiring-soon",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        text: `${daysToExpiry} days left`,
      };
    } else if (daysToExpiry <= 90) {
      return {
        status: "expires-soon",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        text: `${daysToExpiry} days left`,
      };
    } else {
      return {
        status: "valid",
        color: "text-green-600",
        bgColor: "bg-green-50",
        text: `${daysToExpiry} days left`,
      };
    }
  };

  const daysToExpiry = calculateDaysToExpiry(document.expiryDate);
  const expiryStatus = getExpiryStatus(daysToExpiry);

  return (
    <Card 
      className={`${isEncrypted && onView ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={isEncrypted && onView ? () => onView(document) : undefined}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <h3 className="font-medium">{document.type}</h3>
                {isEncrypted && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                    <Lock className="w-3 h-3 mr-1" />
                    Encriptado
                  </Badge>
                )}
              </div>

              {expiryStatus && (
                <div
                  className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${expiryStatus.bgColor} ${expiryStatus.color}`}
                >
                  {expiryStatus.status === "expired" ? (
                    <AlertTriangle className="w-3 h-3" />
                  ) : (
                    <Clock className="w-3 h-3" />
                  )}
                  <span>{expiryStatus.text}</span>
                </div>
              )}
            </div>

            <div className="flex space-x-4">
              {/* Document Photo */}
              {document.photo && document.photo !== "encrypted" && (
                <div className="flex-shrink-0">
                  <img
                    src={document.photo}
                    alt="Document"
                    className="w-20 h-20 object-cover rounded-lg border"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
              
              {/* Encrypted Document Placeholder */}
              {document.photo === "encrypted" && (
                <div className="flex-shrink-0">
                  <div className="w-20 h-20 bg-green-50 border border-green-200 rounded-lg flex items-center justify-center">
                    <Lock className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              )}

              {/* Document Details */}
              <div className="flex-1">
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
                    <p className="font-medium">
                      {document.issueDate === "••••••••" || !document.issueDate 
                        ? "••••••••" 
                        : (() => {
                            try {
                              const date = new Date(document.issueDate);
                              return isNaN(date.getTime()) ? "Fecha inválida" : date.toLocaleDateString();
                            } catch {
                              return "Fecha inválida";
                            }
                          })()
                      }
                    </p>
                  </div>
                  )}

                  {document.expiryDate && (
                  <div>
                    <p className="text-gray-600">Expiry Date</p>
                    <p className="font-medium">
                      {document.expiryDate === "••••••••" || !document.expiryDate 
                        ? "••••••••" 
                        : (() => {
                            try {
                              const date = new Date(document.expiryDate);
                              return isNaN(date.getTime()) ? "Fecha inválida" : date.toLocaleDateString();
                            } catch {
                              return "Fecha inválida";
                            }
                          })()
                      }
                    </p>
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
            </div>
          </div>

          <div className="flex space-x-2 ml-4">
            {!isEncrypted && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(document)}
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(document.id)}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Export as default
export default DocumentCard;
