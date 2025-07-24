import { Building, CalendarIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { JollyRangeCalendar } from "@/components/ui/range-calendar";
import {
  parseDate,
  getLocalTimeZone,
  today,
  CalendarDate,
} from "@internationalized/date";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface DestinationBooking {
  destination: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
}

interface MultiDestinationBookingProps {
  bookings: DestinationBooking[];
  onUpdateBooking: (
    index: number,
    field: keyof DestinationBooking,
    value: string | number
  ) => void;
}

const MultiDestinationBooking = ({
  bookings,
  onUpdateBooking,
}: MultiDestinationBookingProps) => {
  const [openPopovers, setOpenPopovers] = useState<{ [key: number]: boolean }>(
    {}
  );

  const handleDateRangeChange = (
    index: number,
    range: { start: CalendarDate | null; end: CalendarDate | null } | null
  ) => {
    if (range?.start && range?.end) {
      const checkIn = format(
        new Date(range.start.year, range.start.month - 1, range.start.day),
        "yyyy-MM-dd"
      );
      const checkOut = format(
        new Date(range.end.year, range.end.month - 1, range.end.day),
        "yyyy-MM-dd"
      );
      onUpdateBooking(index, "checkIn", checkIn);
      onUpdateBooking(index, "checkOut", checkOut);
      setOpenPopovers((prev) => ({ ...prev, [index]: false }));
    }
  };

  const getDateRangeValue = (booking: DestinationBooking) => {
    if (booking.checkIn && booking.checkOut) {
      return {
        start: parseDate(booking.checkIn),
        end: parseDate(booking.checkOut),
      };
    }
    return null;
  };

  const formatDateRange = (booking: DestinationBooking) => {
    if (booking.checkIn && booking.checkOut) {
      return `${format(new Date(booking.checkIn), "dd/MM/yyyy")} - ${format(new Date(booking.checkOut), "dd/MM/yyyy")}`;
    }
    return "Seleccionar fechas de estancia";
  };

  const togglePopover = (index: number, isOpen: boolean) => {
    setOpenPopovers((prev) => ({ ...prev, [index]: isOpen }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Building size={16} className="text-green-600" />
        <span className="font-medium text-green-800">
          Hoteles para Cada Destino
        </span>
      </div>

      {bookings.map((booking, index) => (
        <Card key={index} className="border-green-200">
          <CardContent className="p-4 space-y-3">
            <h4 className="font-medium text-gray-900">
              {booking.destination} - Hotel {index + 1}
            </h4>

            <div className="space-y-3">
              <div>
                <Label className="text-xs">Fechas de Estancia</Label>
                <Popover
                  open={openPopovers[index] || false}
                  onOpenChange={(isOpen) => togglePopover(index, isOpen)}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal text-sm",
                        (!booking.checkIn || !booking.checkOut) &&
                          "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formatDateRange(booking)}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <JollyRangeCalendar
                      value={getDateRangeValue(booking)}
                      onChange={(range) => handleDateRangeChange(index, range)}
                      minValue={today(getLocalTimeZone())}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Huéspedes</Label>
                  <Input
                    type="number"
                    min="1"
                    max="12"
                    value={booking.guests}
                    onChange={(e) =>
                      onUpdateBooking(index, "guests", parseInt(e.target.value))
                    }
                    className="text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Habitaciones</Label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={booking.rooms}
                    onChange={(e) =>
                      onUpdateBooking(index, "rooms", parseInt(e.target.value))
                    }
                    className="text-sm"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MultiDestinationBooking;
