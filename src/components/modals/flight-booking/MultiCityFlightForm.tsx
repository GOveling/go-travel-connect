
import { Calendar, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface MultiCityFlight {
  from: string;
  to: string;
  departDate: string;
  passengers: number;
  class: string;
}

interface MultiCityFlightFormProps {
  multiCityFlights: MultiCityFlight[];
  setMultiCityFlights: (flights: MultiCityFlight[] | ((prev: MultiCityFlight[]) => MultiCityFlight[])) => void;
}

const flightClasses = [
  { value: 'economy', label: 'Economy', price: '$299' },
  { value: 'premium', label: 'Premium Economy', price: '$599' },
  { value: 'business', label: 'Business', price: '$1,299' },
  { value: 'first', label: 'First Class', price: '$2,499' }
];

const MultiCityFlightForm = ({ multiCityFlights, setMultiCityFlights }: MultiCityFlightFormProps) => {
  const updateMultiCityFlight = (index: number, field: keyof MultiCityFlight, value: any) => {
    setMultiCityFlights(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      console.log(`Updated flight ${index + 1} ${field}:`, value);
      console.log('Updated multiCityFlights:', updated);
      return updated;
    });
  };

  return (
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
            {multiCityFlights[0]?.departDate && (
              <p className="text-xs text-blue-600 mt-1">
                🤖 Auto-filled with trip start date ({multiCityFlights[0]?.departDate})
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
                🤖 Auto-filled with trip end date ({multiCityFlights[1]?.departDate})
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
  );
};

export default MultiCityFlightForm;
