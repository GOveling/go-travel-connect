
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, Calendar, Users, MapPin } from "lucide-react";

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
  tripType: 'round-trip' | 'one-way' | 'multi-city' | 'manual';
  formData: FormData;
  multiCityFlights: MultiCityFlight[];
  onBack: () => void;
  onComplete: () => void;
}

const ConfirmationStep = ({ tripType, formData, multiCityFlights, onBack, onComplete }: ConfirmationStepProps) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const renderFlightSummary = () => {
    if (tripType === 'multi-city') {
      return (
        <div className="space-y-3">
          {multiCityFlights.map((flight, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>
                <div>
                  <div className="font-medium">{flight.from} → {flight.to}</div>
                  <div className="text-sm text-gray-600">{formatDate(flight.departDate)}</div>
                </div>
              </div>
              <div className="text-right text-sm text-gray-600">
                <div>{flight.passengers} passenger{flight.passengers > 1 ? 's' : ''}</div>
                <div className="capitalize">{flight.class}</div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <MapPin size={20} className="text-blue-500" />
            <span className="font-medium">Route</span>
          </div>
          <span>{formData.from} → {formData.to}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar size={20} className="text-blue-500" />
            <span className="font-medium">Departure</span>
          </div>
          <span>{formatDate(formData.departDate)}</span>
        </div>
        
        {(tripType === 'round-trip' || (tripType === 'manual' && formData.returnDate)) && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar size={20} className="text-blue-500" />
              <span className="font-medium">Return</span>
            </div>
            <span>{formatDate(formData.returnDate)}</span>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users size={20} className="text-blue-500" />
            <span className="font-medium">Passengers</span>
          </div>
          <span>{formData.passengers} passenger{formData.passengers > 1 ? 's' : ''}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Plane size={20} className="text-blue-500" />
            <span className="font-medium">Class</span>
          </div>
          <span className="capitalize">{formData.class}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Flight Summary</h3>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plane size={20} />
            <span className="capitalize">{tripType.replace('-', ' ')} Flight</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {renderFlightSummary()}
        </CardContent>
      </Card>

      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex-1 h-12"
        >
          Back
        </Button>
        <Button 
          onClick={onComplete}
          className="flex-1 h-12 bg-gradient-to-r from-green-500 to-green-600"
        >
          Search Flights
        </Button>
      </div>
    </div>
  );
};

export default ConfirmationStep;
