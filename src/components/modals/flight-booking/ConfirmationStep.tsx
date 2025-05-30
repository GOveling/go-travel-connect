
import { Plane, Calendar, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Trip {
  id: number;
  name: string;
}

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
  selectedTrip: number | null;
  trips: Trip[];
  onBack: () => void;
  onBook: () => void;
}

const ConfirmationStep = ({
  tripType,
  formData,
  multiCityFlights,
  selectedTrip,
  trips,
  onBack,
  onBook
}: ConfirmationStepProps) => {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold">Flight Summary</h3>
      
      {tripType === 'multi-city' ? (
        <div className="space-y-3">
          {/* Flight 1 Summary */}
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Plane size={16} className="text-blue-600" />
                  <span className="font-medium text-sm">
                    {multiCityFlights[0]?.from} → {multiCityFlights[0]?.to}
                  </span>
                </div>
                <Badge>Flight 1 - One Way</Badge>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar size={14} />
                  <span>{multiCityFlights[0]?.departDate}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-1">
                  <Users size={14} />
                  <span>{multiCityFlights[0]?.passengers} passenger{multiCityFlights[0]?.passengers > 1 ? 's' : ''}</span>
                </div>
                <span className="capitalize">{multiCityFlights[0]?.class} class</span>
              </div>
            </CardContent>
          </Card>

          {/* Flight 2 Summary */}
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Plane size={16} className="text-green-600" />
                  <span className="font-medium text-sm">
                    {multiCityFlights[1]?.from} → {multiCityFlights[1]?.to}
                  </span>
                </div>
                <Badge className="bg-green-100 text-green-800">Flight 2 - One Way</Badge>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-1">
                  <Calendar size={14} />
                  <span>{multiCityFlights[1]?.departDate}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-1">
                  <Users size={14} />
                  <span>{multiCityFlights[1]?.passengers} passenger{multiCityFlights[1]?.passengers > 1 ? 's' : ''}</span>
                </div>
                <span className="capitalize">{multiCityFlights[1]?.class} class</span>
              </div>
            </CardContent>
          </Card>

          {selectedTrip && (
            <div className="pt-2 border-t border-gray-200">
              <p className="text-xs text-blue-700">
                🤖 Auto-filled multi-city flights from: {trips.find(t => t.id === selectedTrip)?.name}
              </p>
            </div>
          )}
        </div>
      ) : (
        /* Regular flight summary for round-trip and one-way */
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Plane size={16} className="text-blue-600" />
                <span className="font-medium text-sm">
                  {formData.from} → {formData.to}
                </span>
              </div>
              <Badge>{tripType === 'round-trip' ? 'Round Trip' : 'One Way'}</Badge>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar size={14} />
                <span>{formData.departDate}</span>
              </div>
              {tripType === 'round-trip' && formData.returnDate && (
                <div className="flex items-center space-x-1">
                  <Calendar size={14} />
                  <span>{formData.returnDate}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-1">
                <Users size={14} />
                <span>{formData.passengers} passenger{formData.passengers > 1 ? 's' : ''}</span>
              </div>
              <span className="capitalize">{formData.class} class</span>
            </div>

            {selectedTrip && (
              <div className="pt-2 border-t border-blue-200">
                <p className="text-xs text-blue-700">
                  🤖 Auto-filled from: {trips.find(t => t.id === selectedTrip)?.name}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="flex items-center space-x-2 text-green-800">
          <Clock size={16} />
          <span className="text-sm font-medium">Best Price Guarantee</span>
        </div>
        <p className="text-xs text-green-700 mt-1">
          Find a lower price within 24 hours and we'll match it!
        </p>
      </div>

      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex-1 h-12"
        >
          Back
        </Button>
        <Button 
          onClick={onBook}
          className="flex-1 h-12 bg-gradient-to-r from-green-500 to-green-600"
        >
          {tripType === 'multi-city' ? 'Book Flights' : 'Book Flight'}
        </Button>
      </div>
    </div>
  );
};

export default ConfirmationStep;
