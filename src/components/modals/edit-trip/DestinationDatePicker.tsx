
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { JollyRangeCalendar } from "@/components/ui/range-calendar";
import { parseDate, getLocalTimeZone, today, CalendarDate } from "@internationalized/date";

interface DestinationDatePickerProps {
  startDate?: Date;
  endDate?: Date;
  onDateRangeChange: (startDate: Date | undefined, endDate: Date | undefined) => void;
  placeholder: string;
  disabled?: (date: Date) => boolean;
}

const DestinationDatePicker = ({ 
  startDate, 
  endDate, 
  onDateRangeChange, 
  placeholder, 
  disabled 
}: DestinationDatePickerProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleRangeChange = (range: { start: CalendarDate | null; end: CalendarDate | null } | null) => {
    if (range?.start && range?.end) {
      const startJSDate = new Date(range.start.year, range.start.month - 1, range.start.day);
      const endJSDate = new Date(range.end.year, range.end.month - 1, range.end.day);
      onDateRangeChange(startJSDate, endJSDate);
      setIsOpen(false);
    } else if (range?.start) {
      const startJSDate = new Date(range.start.year, range.start.month - 1, range.start.day);
      onDateRangeChange(startJSDate, undefined);
    } else {
      onDateRangeChange(undefined, undefined);
    }
  };

  const getInitialValue = () => {
    if (startDate && endDate) {
      return {
        start: parseDate(format(startDate, "yyyy-MM-dd")),
        end: parseDate(format(endDate, "yyyy-MM-dd"))
      };
    } else if (startDate) {
      return {
        start: parseDate(format(startDate, "yyyy-MM-dd")),
        end: null
      };
    }
    return null;
  };

  const formatDateRange = () => {
    if (startDate && endDate) {
      return `${format(startDate, "dd/MM/yyyy")} - ${format(endDate, "dd/MM/yyyy")}`;
    } else if (startDate) {
      return `${format(startDate, "dd/MM/yyyy")} - Seleccionar fin`;
    }
    return placeholder;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal text-xs h-8",
            !startDate && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-1 h-3 w-3" />
          <span>{formatDateRange()}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <JollyRangeCalendar
          value={getInitialValue()}
          onChange={handleRangeChange}
          minValue={today(getLocalTimeZone())}
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
};

export default DestinationDatePicker;
