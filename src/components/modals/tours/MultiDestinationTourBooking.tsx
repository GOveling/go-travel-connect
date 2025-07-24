import { Camera, CalendarIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

interface DestinationTourBooking {
  destination: string;
  startDate: string;
  endDate: string;
  duration: string;
  tourType: string;
  participants: number;
}

interface MultiDestinationTourBookingProps {
  bookings: DestinationTourBooking[];
  onUpdateBooking: (
    index: number,
    field: keyof DestinationTourBooking,
    value: string | number
  ) => void;
}

const MultiDestinationTourBooking = ({
  bookings,
  onUpdateBooking,
}: MultiDestinationTourBookingProps) => {
  const [openPopovers, setOpenPopovers] = useState<{ [key: number]: boolean }>(
    {}
  );

  const handleDateRangeChange = (
    index: number,
    range: { start: CalendarDate | null; end: CalendarDate | null } | null
  ) => {
    if (range?.start && range?.end) {
      const startDate = format(
        new Date(range.start.year, range.start.month - 1, range.start.day),
        "yyyy-MM-dd"
      );
      const endDate = format(
        new Date(range.end.year, range.end.month - 1, range.end.day),
        "yyyy-MM-dd"
      );
      onUpdateBooking(index, "startDate", startDate);
      onUpdateBooking(index, "endDate", endDate);
      setOpenPopovers((prev) => ({ ...prev, [index]: false }));
    }
  };

  const getDateRangeValue = (booking: DestinationTourBooking) => {
    if (booking.startDate && booking.endDate) {
      return {
        start: parseDate(booking.startDate),
        end: parseDate(booking.endDate),
      };
    }
    return null;
  };

  const formatDateRange = (booking: DestinationTourBooking) => {
    if (booking.startDate && booking.endDate) {
      return `${format(new Date(booking.startDate), "dd/MM/yyyy")} - ${format(new Date(booking.endDate), "dd/MM/yyyy")}`;
    }
    return "Seleccionar fechas del tour";
  };

  const togglePopover = (index: number, isOpen: boolean) => {
    setOpenPopovers((prev) => ({ ...prev, [index]: isOpen }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Camera size={16} className="text-orange-600" />
        <span className="font-medium text-orange-800">
          Tours para Cada Destino
        </span>
      </div>

      {bookings.map((booking, index) => (
        <Card key={index} className="border-orange-200">
          <CardContent className="p-4 space-y-3">
            <h4 className="font-medium text-gray-900">
              {booking.destination} - Tour {index + 1}
            </h4>

            <div className="space-y-3">
              <div>
                <Label className="text-xs">Fechas del Tour</Label>
                <Popover
                  open={openPopovers[index] || false}
                  onOpenChange={(isOpen) => togglePopover(index, isOpen)}
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal text-sm",
                        (!booking.startDate || !booking.endDate) &&
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

              <div>
                <Label className="text-xs">Participantes</Label>
                <Input
                  type="number"
                  min="1"
                  max="20"
                  value={booking.participants}
                  onChange={(e) =>
                    onUpdateBooking(
                      index,
                      "participants",
                      parseInt(e.target.value)
                    )
                  }
                  className="text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Tipo de Tour</Label>
                <Select
                  value={booking.tourType}
                  onValueChange={(value) =>
                    onUpdateBooking(index, "tourType", value)
                  }
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="city">City Tours</SelectItem>
                    <SelectItem value="cultural">Cultural Tours</SelectItem>
                    <SelectItem value="food">Food Tours</SelectItem>
                    <SelectItem value="adventure">Adventure Tours</SelectItem>
                    <SelectItem value="historical">Historical Tours</SelectItem>
                    <SelectItem value="nature">Nature Tours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Duración</Label>
                <Select
                  value={booking.duration}
                  onValueChange={(value) =>
                    onUpdateBooking(index, "duration", value)
                  }
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="half-day">
                      Half Day (2-4 hours)
                    </SelectItem>
                    <SelectItem value="full-day">
                      Full Day (6-8 hours)
                    </SelectItem>
                    <SelectItem value="multi-day">
                      Multi-day (2+ days)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MultiDestinationTourBooking;
