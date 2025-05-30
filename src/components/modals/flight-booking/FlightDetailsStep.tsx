
import { Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

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

interface FlightDetailsStepProps {
  tripType: 'round-trip' | 'one-way' | 'multi-city';
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
  multiCityFlights: MultiCityFlight[];
  setMultiCityFlights: (flights: MultiCityFlight[] | ((prev: MultiCityFlight[]) => MultiCityFlight[])) => void;
  onBack: () => void;
  onContinue: () => void;
}

const flightClasses = [
  { value: 'economy', label: 'Economy', price: '$299' },
  { value: 'premium', label: 'Premium Economy', price: '$599' },
  { value: 'business', label: 'Business', price: '$1,299' },
  { value: 'first', label: 'First Class', price: '$2,499' }
];

const FlightDetailsStep = ({
  tripType,
  formData,
  setFormData,
  multiCityFlights,
  setMultiCityFlights,
  onBack,
  onContinue
}: FlightDetailsStepProps) => {
  const canContinue = () => {
    if (tripType === 'multi-city') {
      return multiCityFlights.length >= 2 && 
             multiCityFlights[0]?.departDate && 
             multiCityFlights[1]?.departDate;
    }
    return formData.departDate && (tripType === 'one-way' || formData.returnDate);
  };

  const updateMultiCityFlight = (index: number, field: keyof MultiCityFlight, value: any) => {
    setMultiCityFlights(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  return (
    <div className="space-y-4">
      {tripType === 'multi-city' ? (
        <div className="space-y-4">
          <h3 className="font-semibold">Multi-City Flight Details</h3>
          
          {/* Flight 1 Details - Outbound */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-blue-800">
                Flight 1 - Outbound Journey
              </Label>
              <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                {multiCityFlights[0]?.from} → {multiCityFlights[0]?.to}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium">Departure Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 text-gray-400" size={16} />
                  <Input
                    type="date"
                    value={multiCityFlights[0]?.departDate || ''}
                    onChange={(e) => updateMultiCityFlight(0, 'departDate', e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-xs font-medium">Passengers</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 text-gray-400" size={16} />
                  <Input
                    type="number"
                    min="1"
                    max="9"
                    value={multiCityFlights[0]?.passengers || 1}
                    onChange={(e) => updateMultiCityFlight(0, 'passengers', parseInt(e.target.value))}
                    className="pl-10 h-12"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium">Travel Class</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {flightClasses.map((flightClass) => (
                  <Card
                    key={`flight1-${flightClass.value}`}
                    className={`cursor-pointer transition-all ${
                      multiCityFlights[0]?.class === flightClass.value 
                        ? 'border-blue-500 bg-blue-100' 
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => updateMultiCityFlight(0, 'class', flightClass.value)}
                  >
                    <CardContent className="p-2">
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-medium">{flightClass.label}</p>
                        <p className="text-xs font-semibold text-blue-600">{flightClass.price}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Flight 2 Details - Return */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold text-green-800">
                Flight 2 - Return Journey
              </Label>
              <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                {multiCityFlights[1]?.from} → {multiCityFlights[1]?.to}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-medium">Departure Date</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 text-gray-400" size={16} />
                  <Input
                    type="date"
                    value={multiCityFlights[1]?.departDate || ''}
                    onChange={(e) => updateMultiCityFlight(1, 'departDate', e.target.value)}
                    className="pl-10 h-12"
                  />
                </div>
                {multiCityFlights[1]?.departDate && (
                  <p className="text-xs text-green-600 mt-1">
                    🤖 Auto-filled with trip end date
                  </p>
                )}
              </div>
              
              <div>
                <Label className="text-xs font-medium">Passengers</Label>
                <div className="relative">
                  <Users className="absolute left-3 top-3 text-gray-400" size={16} />
                  <Input
                    type="number"
                    min="1"
                    max="9"
                    value={multiCityFlights[1]?.passengers || 1}
                    onChange={(e) => updateMultiCityFlight(1, 'passengers', parseInt(e.target.value))}
                    className="pl-10 h-12"
                  />
                </div>
              </div>
            </div>

            <div>
              <Label className="text-xs font-medium">Travel Class</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {flightClasses.map((flightClass) => (
                  <Card
                    key={`flight2-${flightClass.value}`}
                    className={`cursor-pointer transition-all ${
                      multiCityFlights[1]?.class === flightClass.value 
                        ? 'border-green-500 bg-green-100' 
                        : 'hover:border-gray-300'
                    }`}
                    onClick={() => updateMultiCityFlight(1, 'class', flightClass.value)}
                  >
                    <CardContent className="p-2">
                      <div className="flex justify-between items-center">
                        <p className="text-xs font-medium">{flightClass.label}</p>
                        <p className="text-xs font-semibold text-green-600">{flightClass.price}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Regular flight details for round-trip and one-way */
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="departDate" className="text-sm">Departure</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 text-gray-400" size={16} />
                <Input
                  id="departDate"
                  type="date"
                  value={formData.departDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, departDate: e.target.value }))}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            {tripType === 'round-trip' && (
              <div>
                <Label htmlFor="returnDate" className="text-sm">Return</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 text-gray-400" size={16} />
                  <Input
                    id="returnDate"
                    type="date"
                    value={formData.returnDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, returnDate: e.target.value }))}
                    className="pl-10 h-12"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="passengers" className="text-sm">Passengers</Label>
            <div className="relative">
              <Users className="absolute left-3 top-3 text-gray-400" size={16} />
              <Input
                id="passengers"
                type="number"
                min="1"
                max="9"
                value={formData.passengers}
                onChange={(e) => setFormData(prev => ({ ...prev, passengers: parseInt(e.target.value) }))}
                className="pl-10 h-12"
              />
            </div>
          </div>

          <div>
            <Label className="text-sm">Class</Label>
            <div className="grid grid-cols-1 gap-2 mt-2">
              {flightClasses.map((flightClass) => (
                <Card
                  key={flightClass.value}
                  className={`cursor-pointer transition-all ${
                    formData.class === flightClass.value 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'hover:border-gray-300'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, class: flightClass.value }))}
                >
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium text-sm">{flightClass.label}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-blue-600">{flightClass.price}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="flex space-x-2">
        <Button 
          variant="outline" 
          onClick={onBack}
          className="flex-1 h-12"
        >
          Back
        </Button>
        <Button 
          onClick={onContinue}
          className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-blue-600"
          disabled={!canContinue()}
        >
          Review
        </Button>
      </div>
    </div>
  );
};

export default FlightDetailsStep;
