import { useState } from "react";
import { Calendar, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
import { useLanguage } from "@/hooks/useLanguage";

interface NewTripDatePickerProps {
  startDate?: Date;
  endDate?: Date;
  datesNotSet: boolean;
  onDateRangeChange: (
    range: { start: CalendarDate | null; end: CalendarDate | null } | null
  ) => void;
  onNotSureYet: () => void;
  onSetDatesNow: () => void;
}

const NewTripDatePicker = ({
  startDate,
  endDate,
  datesNotSet,
  onDateRangeChange,
  onNotSureYet,
  onSetDatesNow,
}: NewTripDatePickerProps) => {
  const { t } = useLanguage();
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);

  const getDateRangeValue = () => {
    if (startDate && endDate) {
      return {
        start: parseDate(format(startDate, "yyyy-MM-dd")),
        end: parseDate(format(endDate, "yyyy-MM-dd")),
      };
    } else if (startDate) {
      return {
        start: parseDate(format(startDate, "yyyy-MM-dd")),
        end: null,
      };
    }
    return null;
  };

  const formatDateRange = () => {
    if (startDate && endDate) {
      return `${format(startDate, "dd/MM/yyyy")} - ${format(endDate, "dd/MM/yyyy")}`;
    } else if (startDate) {
      return `${format(startDate, "dd/MM/yyyy")} - ${t("trips.newTripModal.dates.selectEndDate")}`;
    }
    return t("trips.newTripModal.dates.selectDateRange");
  };

  const handleDateRangeChange = (
    range: { start: CalendarDate | null; end: CalendarDate | null } | null
  ) => {
    onDateRangeChange(range);
    if (range?.start && range?.end) {
      setIsDateRangeOpen(false);
    }
  };

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium flex items-center gap-1">
        <Calendar size={16} />
        {t("trips.newTripModal.dates.travelDates")}
      </Label>

      {datesNotSet ? (
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700 mb-2">
            {t("trips.newTripModal.dates.notSetMessage")}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSetDatesNow}
            className="text-blue-600 border-blue-300"
          >
            {t("trips.newTripModal.dates.setDatesButton")}
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <Popover open={isDateRangeOpen} onOpenChange={setIsDateRangeOpen}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  (!startDate || !endDate) && "text-muted-foreground"
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

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onNotSureYet}
            className="w-full text-gray-600 border-gray-300 hover:bg-gray-50"
          >
            {t("trips.newTripModal.dates.notSureButton")}
          </Button>
        </div>
      )}
    </div>
  );
};

export default NewTripDatePicker;
