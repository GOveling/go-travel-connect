
import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker, SelectSingleEventHandler, SelectRangeEventHandler, DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker> & {
  onConfirm?: (date: Date | undefined) => void;
  showConfirmButton?: boolean;
  onClose?: () => void;
  onSelect?: SelectSingleEventHandler | SelectRangeEventHandler;
};

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  onConfirm,
  showConfirmButton = false,
  onClose,
  mode,
  selected,
  defaultMonth,
  onSelect,
  ...props
}: CalendarProps) {
  const [month, setMonth] = React.useState<Date>(defaultMonth || new Date());
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(() => {
    if (Array.isArray(selected)) {
      return selected[0] as Date | undefined;
    }
    return selected as Date | undefined;
  });

  const handleDateSelect = React.useCallback((date: Date | DateRange | undefined) => {
    if (mode === 'range') {
      // For range mode, date is DateRange
      const range = date as DateRange;
      if (range?.from) {
        setSelectedDate(range.from);
      }
      if (!showConfirmButton && onSelect) {
        (onSelect as SelectRangeEventHandler)(range, range?.from, {}, {} as any);
        if (onClose && range?.from) {
          setTimeout(() => onClose(), 100);
        }
      }
    } else {
      // For single mode, date is Date | undefined
      const singleDate = date as Date | undefined;
      setSelectedDate(singleDate);
      if (!showConfirmButton && onSelect && singleDate) {
        (onSelect as SelectSingleEventHandler)(singleDate, singleDate, {}, {} as any);
        if (onClose) {
          setTimeout(() => onClose(), 100);
        }
      }
    }
  }, [mode, showConfirmButton, onSelect, onClose]);

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm(selectedDate);
    }
    if (onSelect && selectedDate) {
      if (mode === 'single' || !mode) {
        (onSelect as SelectSingleEventHandler)(selectedDate, selectedDate, {}, {} as any);
      } else if (mode === 'range') {
        (onSelect as SelectRangeEventHandler)({ from: selectedDate, to: selectedDate }, selectedDate, {}, {} as any);
      }
    }
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className="space-y-3">
      <DayPicker
        showOutsideDays={showOutsideDays}
        className={cn("p-3 pointer-events-auto", className)}
        month={month}
        onMonthChange={setMonth}
        selected={selectedDate}
        onSelect={handleDateSelect}
        mode={mode || "single"}
        weekStartsOn={1}
        formatters={{
          formatWeekdayName: (date) => {
            const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
            return weekdays[date.getDay() === 0 ? 6 : date.getDay() - 1];
          }
        }}
        classNames={{
          months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
          month: "space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm font-medium",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          ),
          nav_button_previous: "absolute left-1",
          nav_button_next: "absolute right-1",
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: "text-gray-700 rounded-md w-9 font-medium text-sm text-center py-2",
          row: "flex w-full mt-2",
          cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
          day: cn(
            buttonVariants({ variant: "ghost" }),
            "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
          ),
          day_range_end: "day-range-end",
          day_selected:
            "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
          day_today: "bg-accent text-accent-foreground",
          day_outside:
            "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
          day_disabled: "text-muted-foreground opacity-50",
          day_range_middle:
            "aria-selected:bg-accent aria-selected:text-accent-foreground",
          day_hidden: "invisible",
          ...classNames,
        }}
        components={{
          IconLeft: ({ ..._props }) => <ChevronLeft className="h-4 w-4" />,
          IconRight: ({ ..._props }) => <ChevronRight className="h-4 w-4" />,
        }}
        {...props}
      />
      {showConfirmButton && (
        <div className="flex justify-end px-3 pb-3">
          <Button 
            onClick={handleConfirm}
            disabled={!selectedDate}
            size="sm"
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Confirm
          </Button>
        </div>
      )}
    </div>
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
