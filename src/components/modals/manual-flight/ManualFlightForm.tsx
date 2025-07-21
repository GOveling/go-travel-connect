
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import ManualDateSelection from "./ManualDateSelection";

interface ManualFlightData {
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

interface ManualFlightFormProps {
  flightType: 'round-trip' | 'one-way' | 'multi-city';
  flightData: ManualFlightData;
  setFlightData: (data: ManualFlightData | ((prev: ManualFlightData) => ManualFlightData)) => void;
  multiCityFlights: MultiCityFlight[];
  setMultiCityFlights: (flights: MultiCityFlight[] | ((prev: MultiCityFlight[]) => MultiCityFlight[])) => void;
  isDateRangeOpen: boolean;
  setIsDateRangeOpen: (open: boolean) => void;
  isDepartDateOpen: boolean;
  setIsDepartDateOpen: (open: boolean) => void;
}

const ManualFlightForm = ({
  flightType,
  flightData,
  setFlightData,
  multiCityFlights,
  setMultiCityFlights,
  isDateRangeOpen,
  setIsDateRangeOpen,
  isDepartDateOpen,
  setIsDepartDateOpen
}: ManualFlightFormProps) => {

  const addMultiCityFlight = () => {
    setMultiCityFlights(prev => [
      ...prev,
      { from: '', to: '', departDate: '', passengers: 1, class: 'economy' }
    ]);
  };

  const removeMultiCityFlight = (index: number) => {
    if (multiCityFlights.length > 2) {
      setMultiCityFlights(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateMultiCityFlight = (index: number, field: keyof MultiCityFlight, value: string | number) => {
    setMultiCityFlights(prev => prev.map((flight, i) => 
      i === index ? { ...flight, [field]: value } : flight
    ));
  };

  if (flightType === 'multi-city') {
    return (
      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Vuelos Multi-destino</h3>
        
        {multiCityFlights.map((flight, index) => (
          <div key={index} className="p-4 border rounded-lg bg-gray-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm text-gray-700">Vuelo {index + 1}</span>
              {multiCityFlights.length > 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeMultiCityFlight(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 size={14} />
                </Button>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Origen</Label>
                <Input
                  placeholder="Ciudad de origen"
                  value={flight.from}
                  onChange={(e) => updateMultiCityFlight(index, 'from', e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Destino</Label>
                <Input
                  placeholder="Ciudad de destino"
                  value={flight.to}
                  onChange={(e) => updateMultiCityFlight(index, 'to', e.target.value)}
                  className="h-10"
                />
              </div>
            </div>
            
            <ManualDateSelection
              flightType="one-way"
              flightData={{
                ...flightData,
                departDate: flight.departDate,
                returnDate: ''
              }}
              setFlightData={(data) => {
                if (typeof data === 'function') {
                  const newData = data({ ...flightData, departDate: flight.departDate, returnDate: '' });
                  updateMultiCityFlight(index, 'departDate', newData.departDate);
                } else {
                  updateMultiCityFlight(index, 'departDate', data.departDate);
                }
              }}
              isDateRangeOpen={false}
              setIsDateRangeOpen={() => {}}
              isDepartDateOpen={isDepartDateOpen}
              setIsDepartDateOpen={setIsDepartDateOpen}
            />
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs">Pasajeros</Label>
                <Select 
                  value={flight.passengers.toString()} 
                  onValueChange={(value) => updateMultiCityFlight(index, 'passengers', parseInt(value))}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1,2,3,4,5,6,7,8].map(num => (
                      <SelectItem key={num} value={num.toString()}>{num} pasajero{num > 1 ? 's' : ''}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Clase</Label>
                <Select 
                  value={flight.class} 
                  onValueChange={(value) => updateMultiCityFlight(index, 'class', value)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="economy">Económica</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="first">Primera</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        ))}
        
        <Button
          variant="outline"
          onClick={addMultiCityFlight}
          className="w-full border-dashed"
        >
          <Plus size={16} className="mr-2" />
          Agregar Vuelo
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Detalles del Vuelo</h3>
      
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Origen</Label>
          <Input
            placeholder="Ciudad de origen"
            value={flightData.from}
            onChange={(e) => setFlightData(prev => ({ ...prev, from: e.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label>Destino</Label>
          <Input
            placeholder="Ciudad de destino"
            value={flightData.to}
            onChange={(e) => setFlightData(prev => ({ ...prev, to: e.target.value }))}
          />
        </div>
      </div>
      
      <ManualDateSelection
        flightType={flightType}
        flightData={flightData}
        setFlightData={setFlightData}
        isDateRangeOpen={isDateRangeOpen}
        setIsDateRangeOpen={setIsDateRangeOpen}
        isDepartDateOpen={isDepartDateOpen}
        setIsDepartDateOpen={setIsDepartDateOpen}
      />
      
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Pasajeros</Label>
          <Select 
            value={flightData.passengers.toString()} 
            onValueChange={(value) => setFlightData(prev => ({ ...prev, passengers: parseInt(value) }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1,2,3,4,5,6,7,8].map(num => (
                <SelectItem key={num} value={num.toString()}>{num} pasajero{num > 1 ? 's' : ''}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Clase</Label>
          <Select 
            value={flightData.class} 
            onValueChange={(value) => setFlightData(prev => ({ ...prev, class: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="economy">Económica</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="first">Primera</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default ManualFlightForm;
