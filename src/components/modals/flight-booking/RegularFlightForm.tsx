
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon, ArrowLeftRight, Users, Settings } from "lucide-react";

import { DateRange } from "react-day-picker";
import AirportAutocomplete from "@/components/ui/airport-autocomplete";

interface FormData {
  from: string;
  to: string;
  departDate: string;
  returnDate: string;
  passengers: number;
  class: string;
}

interface RegularFlightFormProps {
  tripType: 'round-trip' | 'one-way' | 'multi-city' | 'manual';
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
  isDateRangeOpen: boolean;
  setIsDateRangeOpen: (open: boolean) => void;
  isDepartDateOpen: boolean;
  setIsDepartDateOpen: (open: boolean) => void;
}

const RegularFlightForm = ({
  tripType,
  formData,
  setFormData,
  isDateRangeOpen,
  setIsDateRangeOpen,
  isDepartDateOpen,
  setIsDepartDateOpen
}: RegularFlightFormProps) => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: formData.departDate ? new Date(formData.departDate) : undefined,
    to: formData.returnDate ? new Date(formData.returnDate) : undefined,
  });

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    if (range?.from) {
      setFormData(prev => ({
        ...prev,
        departDate: format(range.from!, 'yyyy-MM-dd'),
        returnDate: range.to ? format(range.to, 'yyyy-MM-dd') : ''
      }));
    }
  };

  const handleDepartDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        departDate: format(date, 'yyyy-MM-dd')
      }));
    }
  };

  const handleSwapCities = () => {
    setFormData(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from
    }));
  };

  return (
    <Card className="border-0 shadow-none">
      <CardContent className="p-0 space-y-4">
        {/* Origin and Destination */}
        <div className="space-y-3">
          <div className="relative">
            <Label htmlFor="from" className="text-sm font-medium text-gray-700">
              Desde
            </Label>
            <AirportAutocomplete
              value={formData.from}
              onChange={(value) => setFormData(prev => ({ ...prev, from: value }))}
              placeholder="Ciudad de origen"
              className="mt-1"
            />
          </div>

          <div className="flex justify-center">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSwapCities}
              className="h-8 w-8 rounded-full p-0"
            >
              <ArrowLeftRight className="h-4 w-4" />
            </Button>
          </div>

          <div className="relative">
            <Label htmlFor="to" className="text-sm font-medium text-gray-700">
              Hacia
            </Label>
            <AirportAutocomplete
              value={formData.to}
              onChange={(value) => setFormData(prev => ({ ...prev, to: value }))}
              placeholder="Ciudad de destino"
              className="mt-1"
            />
          </div>
        </div>

        {/* Dates */}
        <div className="space-y-3">
          {tripType === 'round-trip' ? (
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Fechas de viaje
              </Label>
              <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal mt-1"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "dd MMM", { locale: es })} - {format(dateRange.to, "dd MMM yyyy", { locale: es })}
                        </>
                      ) : (
                        format(dateRange.from, "dd MMM yyyy", { locale: es })
                      )
                    ) : (
                      <span>Seleccionar fechas</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={handleDateRangeChange}
                    numberOfMonths={2}
                    locale={es}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          ) : (
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Fecha de salida
              </Label>
              <Popover open={isDepartDateOpen} onOpenChange={setIsDepartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal mt-1"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.departDate ? (
                      format(new Date(formData.departDate), "dd MMM yyyy", { locale: es })
                    ) : (
                      <span>Seleccionar fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.departDate ? new Date(formData.departDate) : undefined}
                    onSelect={handleDepartDateChange}
                    initialFocus
                    locale={es}
                  />
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>

        {/* Passengers and Class */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-sm font-medium text-gray-700">
              Pasajeros
            </Label>
            <Select
              value={formData.passengers.toString()}
              onValueChange={(value) => setFormData(prev => ({ ...prev, passengers: parseInt(value) }))}
            >
              <SelectTrigger className="mt-1">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                  <SelectItem key={num} value={num.toString()}>
                    {num} {num === 1 ? 'Pasajero' : 'Pasajeros'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-sm font-medium text-gray-700">
              Clase
            </Label>
            <Select
              value={formData.class}
              onValueChange={(value) => setFormData(prev => ({ ...prev, class: value }))}
            >
              <SelectTrigger className="mt-1">
                <div className="flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="economy">Económica</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
                <SelectItem value="business">Ejecutiva</SelectItem>
                <SelectItem value="first">Primera</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RegularFlightForm;
