
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Plane, Calendar, Users, MapPin } from "lucide-react";

interface FormData {
  from: string;
  to: string;
  departDate: string;
  returnDate: string;
  passengers: number;
  class: string;
}

interface MultiCityFlight {
  from: string;
  to: string;
  departDate: string;
  passengers: number;
  class: string;
}

interface ConfirmationStepProps {
  tripType: 'round-trip' | 'one-way' | 'multi-city';
  formData: FormData;
  multiCityFlights: MultiCityFlight[];
  onBack: () => void;
  onComplete: () => void;
}

const ConfirmationStep = ({
  tripType,
  formData,
  multiCityFlights,
  onBack,
  onComplete
}: ConfirmationStepProps) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <CheckCircle className="w-12 h-12 text-green-500 mx-auto" />
        <h3 className="text-lg font-semibold">Review Your Flight Details</h3>
        <p className="text-sm text-gray-600">Please confirm the details below</p>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center space-x-2 text-blue-600">
            <Plane size={16} />
            <span className="font-medium">Flight Information</span>
          </div>

          {tripType === 'multi-city' ? (
            <div className="space-y-3">
              {multiCityFlights.map((flight, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm">Flight {index + 1}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm mt-2">
                    <div>
                      <span className="text-gray-600">From:</span>
                      <p className="font-medium">{flight.from || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">To:</span>
                      <p className="font-medium">{flight.to || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Date:</span>
                      <p className="font-medium">{formatDate(flight.departDate)}</p>
                    </div>
                    <div>
                      <span className="text-gray-600">Class:</span>
                      <p className="font-medium capitalize">{flight.class}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">From:</span>
                <p className="font-medium">{formData.from || 'Not specified'}</p>
              </div>
              <div>
                <span className="text-gray-600">To:</span>
                <p className="font-medium">{formData.to || 'Not specified'}</p>
              </div>
              <div>
                <span className="text-gray-600">Departure:</span>
                <p className="font-medium">{formatDate(formData.departDate)}</p>
              </div>
              {tripType === 'round-trip' && (
                <div>
                  <span className="text-gray-600">Return:</span>
                  <p className="font-medium">{formatDate(formData.returnDate)}</p>
                </div>
              )}
              <div>
                <span className="text-gray-600">Passengers:</span>
                <p className="font-medium">{formData.passengers}</p>
              </div>
              <div>
                <span className="text-gray-600">Class:</span>
                <p className="font-medium capitalize">{formData.class}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex space-x-2">
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back
        </Button>
        <Button onClick={onComplete} className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600">
          Search Flights
        </Button>
      </div>
    </div>
  );
};

export default ConfirmationStep;
