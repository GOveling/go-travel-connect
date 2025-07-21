
import React from "react";
import { Calendar, Users, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import AviasalesAutocomplete from "@/components/ui/aviasales-autocomplete";

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

interface ManualFlightFormProps {
  flightType: 'round-trip' | 'one-way' | 'multi-city';
  flightData: FormData;
  setFlightData: (data: FormData) => void;
  multiCityFlights: MultiCityFlight[];
  setMultiCityFlights: (flights: MultiCityFlight[]) => void;
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
  const handleDateSelect = (date: Date | undefined, type: 'depart' | 'return') => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      if (type === 'depart') {
        setFlightData({ ...flightData, departDate: formattedDate });
        setIsDepartDateOpen(false);
      } else {
        setFlightData({ ...flightData, returnDate: formattedDate });
        setIsDateRangeOpen(false);
      }
    }
  };

  const handleMultiCityDateSelect = (date: Date | undefined, flightIndex: number) => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const updatedFlights = multiCityFlights.map((flight, index) =>
        index === flightIndex ? { ...flight, departDate: formattedDate } : flight
      );
      setMultiCityFlights(updatedFlights);
    }
  };

  const updateMultiCityFlight = (index: number, field: keyof MultiCityFlight, value: string | number) => {
    const updatedFlights = multiCityFlights.map((flight, i) =>
      i === index ? { ...flight, [field]: value } : flight
    );
    setMultiCityFlights(updatedFlights);
  };

  const addMultiCityFlight = () => {
    setMultiCityFlights([
      ...multiCityFlights,
      { from: '', to: '', departDate: '', passengers: 1, class: 'economy' }
    ]);
  };

  const removeMultiCityFlight = (index: number) => {
    if (multiCityFlights.length > 2) {
      setMultiCityFlights(multiCityFlights.filter((_, i) => i !== index));
    }
  };

  if (flightType === 'multi-city') {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="font-medium text-gray-900 mb-2">Vuelos Multi-destino</h3>
          <p className="text-sm text-gray-600">Configure cada tramo de su viaje</p>
        </div>

        <div className="space-y-4">
          {multiCityFlights.map((flight, index) => (
            <div key={index} className="p-4 border rounded-lg bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-sm">Vuelo {index + 1}</h4>
                {multiCityFlights.length > 2 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeMultiCityFlight(index)}
                    className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                  >
                    ×
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <Label className="text-xs text-gray-600">Origen</Label>
                  <AviasalesAutocomplete
                    value={flight.from}
                    onChange={(value) => updateMultiCityFlight(index, 'from', value)}
                    placeholder="Ciudad de origen"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Destino</Label>
                  <AviasalesAutocomplete
                    value={flight.to}
                    onChange={(value) => updateMultiCityFlight(index, 'to', value)}
                    placeholder="Ciudad de destino"
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-gray-600">Fecha</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal mt-1"
                      >
                        <Calendar className="mr-2 h-4 w-4" />
                        {flight.departDate ? format(new Date(flight.departDate), 'dd/MM/yyyy', { locale: es }) : 'Seleccionar fecha'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent
                        mode="single"
                        selected={flight.departDate ? new Date(flight.departDate) : undefined}
                        onSelect={(date) => handleMultiCityDateSelect(date, index)}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label className="text-xs text-gray-600">Clase</Label>
                  <Select value={flight.class} onValueChange={(value) => updateMultiCityFlight(index, 'class', value)}>
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="economy">Económica</SelectItem>
                      <SelectItem value="business">Ejecutiva</SelectItem>
                      <SelectItem value="first">Primera</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Button 
          onClick={addMultiCityFlight}
          variant="outline"
          className="w-full"
        >
          + Agregar Vuelo
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="font-medium text-gray-900 mb-2">Detalles del Vuelo</h3>
        <p className="text-sm text-gray-600">
          {flightType === 'round-trip' ? 'Ida y vuelta' : 'Solo ida'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-gray-600">Origen</Label>
          <AviasalesAutocomplete
            value={flightData.from}
            onChange={(value) => setFlightData({ ...flightData, from: value })}
            placeholder="Ciudad de origen"
            className="mt-1"
          />
        </div>
        <div>
          <Label className="text-xs text-gray-600">Destino</Label>
          <AviasalesAutocomplete
            value={flightData.to}
            onChange={(value) => setFlightData({ ...flightData, to: value })}
            placeholder="Ciudad de destino"
            className="mt-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-gray-600">Fecha de Salida</Label>
          <Popover open={isDepartDateOpen} onOpenChange={setIsDepartDateOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal mt-1"
              >
                <Calendar className="mr-2 h-4 w-4" />
                {flightData.departDate ? format(new Date(flightData.departDate), 'dd/MM/yyyy', { locale: es }) : 'Seleccionar fecha'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <CalendarComponent
                mode="single"
                selected={flightData.departDate ? new Date(flightData.departDate) : undefined}
                onSelect={(date) => handleDateSelect(date, 'depart')}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        {flightType === 'round-trip' && (
          <div>
            <Label className="text-xs text-gray-600">Fecha de Regreso</Label>
            <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal mt-1"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {flightData.returnDate ? format(new Date(flightData.returnDate), 'dd/MM/yyyy', { locale: es }) : 'Seleccionar fecha'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={flightData.returnDate ? new Date(flightData.returnDate) : undefined}
                  onSelect={(date) => handleDateSelect(date, 'return')}
                  disabled={(date) => date < new Date(flightData.departDate || new Date())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-gray-600">Pasajeros</Label>
          <div className="relative mt-1">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="number"
              value={flightData.passengers}
              onChange={(e) => setFlightData({ ...flightData, passengers: parseInt(e.target.value) || 1 })}
              min="1"
              max="9"
              className="pl-10"
            />
          </div>
        </div>
        <div>
          <Label className="text-xs text-gray-600">Clase</Label>
          <div className="relative mt-1">
            <Settings className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Select value={flightData.class} onValueChange={(value) => setFlightData({ ...flightData, class: value })}>
              <SelectTrigger className="pl-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="economy">Económica</SelectItem>
                <SelectItem value="business">Ejecutiva</SelectItem>
                <SelectItem value="first">Primera</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManualFlightForm;
