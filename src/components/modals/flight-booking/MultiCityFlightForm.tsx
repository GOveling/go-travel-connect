import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, ArrowRight } from "lucide-react";
import AviasalesAutocomplete from "@/components/ui/aviasales-autocomplete";

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

const MultiCityFlightForm = ({ multiCityFlights, setMultiCityFlights }: MultiCityFlightFormProps) => {
  const updateFlight = (index: number, field: keyof MultiCityFlight, value: string | number) => {
    setMultiCityFlights(prev => prev.map((flight, i) => 
      i === index ? { ...flight, [field]: value } : flight
    ));
  };

  const addFlight = () => {
    setMultiCityFlights(prev => [...prev, {
      from: '',
      to: '',
      departDate: '',
      passengers: 1,
      class: 'economy'
    }]);
  };

  const removeFlight = (index: number) => {
    if (multiCityFlights.length > 2) {
      setMultiCityFlights(prev => prev.filter((_, i) => i !== index));
    }
  };

  const formatFlightLabel = (index: number) => {
    const totalFlights = multiCityFlights.length;
    const isLastFlight = index === totalFlights - 1;
    
    // Check if last flight is a return flight (destination matches first flight's origin)
    const isReturnFlight = isLastFlight && 
      multiCityFlights[0]?.from && 
      multiCityFlights[index]?.to === multiCityFlights[0].from;
    
    if (isReturnFlight) {
      return `Vuelo ${index + 1} - Retorno al origen`;
    }
    
    return `Vuelo ${index + 1}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Multi-City Flights</h4>
        <span className="text-sm text-gray-500">{multiCityFlights.length} vuelos planificados</span>
      </div>

      {multiCityFlights.map((flight, index) => (
        <div key={index} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="font-medium text-sm">{formatFlightLabel(index)}</h5>
            {multiCityFlights.length > 2 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFlight(index)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor={`from-${index}`} className="text-sm">Desde</Label>
              <AviasalesAutocomplete
                value={flight.from}
                onChange={(value) => updateFlight(index, 'from', value)}
                placeholder="Ciudad de origen"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor={`to-${index}`} className="text-sm">Hacia</Label>
              <AviasalesAutocomplete
                value={flight.to}
                onChange={(value) => updateFlight(index, 'to', value)}
                placeholder="Ciudad de destino"
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor={`date-${index}`} className="text-sm">Departure Date</Label>
              <input
                id={`date-${index}`}
                type="date"
                value={flight.departDate}
                onChange={(e) => updateFlight(index, 'departDate', e.target.value)}
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <Label htmlFor={`class-${index}`} className="text-sm">Class</Label>
              <Select value={flight.class} onValueChange={(value) => updateFlight(index, 'class', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="economy">Economy</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="first">First Class</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {index < multiCityFlights.length - 1 && (
            <div className="flex justify-center pt-2">
              <ArrowRight size={16} className="text-gray-400" />
            </div>
          )}
        </div>
      ))}

      <Button
        variant="outline"
        onClick={addFlight}
        className="w-full"
      >
        <Plus size={16} className="mr-2" />
        Add Another Flight
      </Button>
    </div>
  );
};

export default MultiCityFlightForm;
