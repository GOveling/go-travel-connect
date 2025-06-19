
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { JollyRangeCalendar, JollyCalendar } from "@/components/ui/range-calendar";
import { parseDate, getLocalTimeZone, today, CalendarDate } from "@internationalized/date";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface FormData {
  from: string;
  to: string;
  departDate: string;
  returnDate: string;
  passengers: number;
  class: string;
}

interface DateSelectionFormProps {
  tripType: 'round-trip' | 'one-way' | 'multi-city';
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
  isDateRangeOpen: boolean;
  setIsDateRangeOpen: (open: boolean) => void;
  isDepartDateOpen: boolean;
  setIsDepartDateOpen: (open: boolean) => void;
}

const DateSelectionForm = ({
  tripType,
  formData,
  setFormData,
  isDateRangeOpen,
  setIsDateRangeOpen,
  isDepartDateOpen,
  setIsDepartDateOpen
}: DateSelectionFormProps) => {
  const handleDateRangeChange = (range: { start: CalendarDate | null; end: CalendarDate | null } | null) => {
    if (range?.start && range?.end) {
      const departDate = format(new Date(range.start.year, range.start.month - 1, range.start.day), "yyyy-MM-dd");
      const returnDate = format(new Date(range.end.year, range.end.month - 1, range.end.day), "yyyy-MM-dd");
      setFormData(prev => ({
        ...prev,
        departDate,
        returnDate
      }));
      setIsDateRangeOpen(false);
    }
  };

  const handleDepartDateChange = (date: CalendarDate | null) => {
    if (date) {
      const departDate = format(new Date(date.year, date.month - 1, date.day), "yyyy-MM-dd");
      setFormData(prev => ({
        ...prev,
        departDate
      }));
      setIsDepartDateOpen(false);
    }
  };

  const getDateRangeValue = () => {
    if (formData.departDate && formData.returnDate) {
      return {
        start: parseDate(formData.departDate),
        end: parseDate(formData.returnDate)
      };
    }
    return null;
  };

  const getDepartDateValue = () => {
    if (formData.departDate) {
      return parseDate(formData.departDate);
    }
    return null;
  };

  const formatDateRange = () => {
    if (formData.departDate && formData.returnDate) {
      return `${format(new Date(formData.departDate), "dd/MM/yyyy")} - ${format(new Date(formData.returnDate), "dd/MM/yyyy")}`;
    }
    return "Seleccionar fechas del vuelo";
  };

  const formatDepartDate = () => {
    if (formData.departDate) {
      return format(new Date(formData.departDate), "dd/MM/yyyy");
    }
    return "Seleccionar fecha de salida";
  };

  if (tripType === 'round-trip') {
    return (
      <div className="space-y-2">
        <Label>Fechas del Vuelo (Ida y Vuelta)</Label>
        <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                (!formData.departDate || !formData.returnDate) && "text-muted-foreground"
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
  } else {
    return (
      <div className="space-y-2">
        <Label>Fecha de Salida</Label>
        <Popover open={isDepartDateOpen} onOpenChange={setIsDepartDateOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !formData.departDate && "text-muted-foreground"
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
  }
};

export default DateSelectionForm;
