
import { Building, Users, CalendarIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { JollyRangeCalendar } from "@/components/ui/range-calendar";
import { parseDate, getLocalTimeZone, today, CalendarDate } from "@internationalized/date";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface FormData {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}

interface SingleDestinationFormProps {
  formData: FormData;
  onFormDataChange: (data: FormData | ((prev: FormData) => FormData)) => void;
}

const SingleDestinationForm = ({ formData, onFormDataChange }: SingleDestinationFormProps) => {
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);

  const handleDateRangeChange = (range: { start: CalendarDate | null; end: CalendarDate | null } | null) => {
    if (range?.start && range?.end) {
      const checkIn = format(new Date(range.start.year, range.start.month - 1, range.start.day), "yyyy-MM-dd");
      const checkOut = format(new Date(range.end.year, range.end.month - 1, range.end.day), "yyyy-MM-dd");
      onFormDataChange(prev => ({
        ...prev,
        checkIn,
        checkOut
      }));
      setIsDateRangeOpen(false);
    }
  };

  const getDateRangeValue = () => {
    if (formData.checkIn && formData.checkOut) {
      return {
        start: parseDate(formData.checkIn),
        end: parseDate(formData.checkOut)
      };
    }
    return null;
  };

  const formatDateRange = () => {
    if (formData.checkIn && formData.checkOut) {
      return `${format(new Date(formData.checkIn), "dd/MM/yyyy")} - ${format(new Date(formData.checkOut), "dd/MM/yyyy")}`;
    }
    return "Seleccionar fechas de estancia";
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="destination">Destination</Label>
        <div className="relative">
          <Building size={16} className="absolute left-3 top-3 text-gray-400" />
          <Input
            id="destination"
            placeholder="Where do you want to stay?"
            value={formData.destination}
            onChange={(e) => onFormDataChange(prev => ({ ...prev, destination: e.target.value }))}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Fechas de Estancia</Label>
        <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                (!formData.checkIn || !formData.checkOut) && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formatDateRange()}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <JollyRangeCalendar
              value={getDateRangeValue()}
              onChange={handleDateRangeChange}
              minValue={today(getLocalTimeZone())}
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="guests">Guests</Label>
          <div className="relative">
            <Users size={16} className="absolute left-3 top-3 text-gray-400" />
            <Input
              id="guests"
              type="number"
              min="1"
              max="12"
              value={formData.guests}
              onChange={(e) => onFormDataChange(prev => ({ ...prev, guests: parseInt(e.target.value) }))}
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="rooms">Rooms</Label>
          <Input
            id="rooms"
            type="number"
            min="1"
            max="5"
            value={formData.rooms}
            onChange={(e) => onFormDataChange(prev => ({ ...prev, rooms: parseInt(e.target.value) }))}
          />
        </div>
      </div>
    </div>
  );
};

export default SingleDestinationForm;
