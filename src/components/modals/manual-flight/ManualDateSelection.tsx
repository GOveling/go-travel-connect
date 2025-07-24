import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  JollyRangeCalendar,
  JollyCalendar,
} from "@/components/ui/range-calendar";
import {
  parseDate,
  getLocalTimeZone,
  today,
  CalendarDate,
} from "@internationalized/date";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ManualFlightData {
  from: string;
  to: string;
  departDate: string;
  returnDate: string;
  passengers: number;
  class: string;
}

interface ManualDateSelectionProps {
  flightType: "round-trip" | "one-way" | "multi-city";
  flightData: ManualFlightData;
  setFlightData: (
    data: ManualFlightData | ((prev: ManualFlightData) => ManualFlightData)
  ) => void;
  isDateRangeOpen: boolean;
  setIsDateRangeOpen: (open: boolean) => void;
  isDepartDateOpen: boolean;
  setIsDepartDateOpen: (open: boolean) => void;
}

const ManualDateSelection = ({
  flightType,
  flightData,
  setFlightData,
  isDateRangeOpen,
  setIsDateRangeOpen,
  isDepartDateOpen,
  setIsDepartDateOpen,
}: ManualDateSelectionProps) => {
  const handleDateRangeChange = (
    range: { start: CalendarDate | null; end: CalendarDate | null } | null
  ) => {
    if (range?.start && range?.end) {
      const departDate = format(
        new Date(range.start.year, range.start.month - 1, range.start.day),
        "yyyy-MM-dd"
      );
      const returnDate = format(
        new Date(range.end.year, range.end.month - 1, range.end.day),
        "yyyy-MM-dd"
      );
      setFlightData((prev) => ({
        ...prev,
        departDate,
        returnDate,
      }));
      setIsDateRangeOpen(false);
    }
  };

  const handleDepartDateChange = (date: CalendarDate | null) => {
    if (date) {
      const departDate = format(
        new Date(date.year, date.month - 1, date.day),
        "yyyy-MM-dd"
      );
      setFlightData((prev) => ({
        ...prev,
        departDate,
      }));
      setIsDepartDateOpen(false);
    }
  };

  const getDateRangeValue = () => {
    if (flightData.departDate && flightData.returnDate) {
      return {
        start: parseDate(flightData.departDate),
        end: parseDate(flightData.returnDate),
      };
    }
    return null;
  };

  const getDepartDateValue = () => {
    if (flightData.departDate) {
      return parseDate(flightData.departDate);
    }
    return null;
  };

  const formatDateRange = () => {
    if (flightData.departDate && flightData.returnDate) {
      return `${format(new Date(flightData.departDate), "dd/MM")} - ${format(new Date(flightData.returnDate), "dd/MM")}`;
    }
    return "Seleccionar fechas";
  };

  const formatDepartDate = () => {
    if (flightData.departDate) {
      return format(new Date(flightData.departDate), "dd/MM/yyyy");
    }
    return "Fecha de salida";
  };

  if (flightType === "round-trip") {
    return (
      <div className="space-y-2">
        <Label className="text-sm">Fechas (Ida y Vuelta)</Label>
        <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal h-10",
                (!flightData.departDate || !flightData.returnDate) &&
                  "text-muted-foreground"
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
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm">Fecha de Salida</Label>
      <Popover open={isDepartDateOpen} onOpenChange={setIsDepartDateOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal h-10",
              !flightData.departDate && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDepartDate()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <JollyCalendar
            value={getDepartDateValue()}
            onChange={handleDepartDateChange}
            minValue={today(getLocalTimeZone())}
            className="p-3 pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ManualDateSelection;
