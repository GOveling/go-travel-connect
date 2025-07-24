import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, X, Calendar } from "lucide-react";
import { addDays, format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { JollyCalendar } from "@/components/ui/range-calendar";
import {
  parseDate,
  getLocalTimeZone,
  today,
  CalendarDate,
} from "@internationalized/date";

interface Destination {
  name: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
}

interface DestinationFormProps {
  destinations: Destination[];
  onDestinationsChange: (destinations: Destination[]) => void;
  calculatedDates: string;
}

const DestinationForm = ({
  destinations,
  onDestinationsChange,
  calculatedDates,
}: DestinationFormProps) => {
  const [openPopovers, setOpenPopovers] = useState<{ [key: string]: boolean }>(
    {}
  );

  const addDestination = () => {
    const newDestination: Destination = {
      name: "",
      startDate: undefined,
      endDate: undefined,
    };

    // If there are existing destinations, set the start date of the new destination
    // to one day after the last destination's end date
    if (destinations.length > 0) {
      const lastDestination = destinations[destinations.length - 1];
      if (lastDestination.endDate) {
        newDestination.startDate = addDays(lastDestination.endDate, 1);
        newDestination.endDate = addDays(newDestination.startDate, 1);
      }
    }

    onDestinationsChange([...destinations, newDestination]);
  };

  const removeDestination = (index: number) => {
    if (destinations.length > 1) {
      const updatedDestinations = destinations.filter((_, i) => i !== index);
      // After removing, update subsequent destinations to maintain the cascade
      updateCascadingDates(updatedDestinations, index - 1);
    }
  };

  const updateCascadingDates = (
    destinations: Destination[],
    startFromIndex: number
  ) => {
    const updated = [...destinations];

    // Start cascading from the given index
    for (let i = Math.max(0, startFromIndex); i < updated.length - 1; i++) {
      const currentDest = updated[i];
      const nextDest = updated[i + 1];

      if (currentDest.endDate) {
        // Set next destination's start date to one day after current destination's end date
        nextDest.startDate = addDays(currentDest.endDate, 1);

        // If the next destination doesn't have an end date or the end date is before the new start date,
        // set it to one day after the start date
        if (!nextDest.endDate || nextDest.endDate <= nextDest.startDate) {
          nextDest.endDate = addDays(nextDest.startDate, 1);
        }
      }
    }

    onDestinationsChange(updated);
  };

  const updateDestination = (
    index: number,
    field: string,
    value: string | Date | undefined
  ) => {
    const updated = destinations.map((dest, i) => {
      if (i === index) {
        const updatedDest = { ...dest, [field]: value };

        // If updating start date, automatically set end date to next day if end date is not set or is before start date
        if (field === "startDate" && value instanceof Date) {
          if (!updatedDest.endDate || updatedDest.endDate <= value) {
            updatedDest.endDate = addDays(value, 1);
          }
        }

        return updatedDest;
      }
      return dest;
    });

    // If we're updating an end date, cascade the changes to subsequent destinations
    if (field === "endDate" && value instanceof Date) {
      updateCascadingDates(updated, index);
    } else {
      onDestinationsChange(updated);
    }
  };

  const handleDateChange = (
    index: number,
    field: "startDate" | "endDate",
    date: CalendarDate | null
  ) => {
    if (date) {
      const jsDate = new Date(date.year, date.month - 1, date.day);
      updateDestination(index, field, jsDate);
    }
    setOpenPopovers((prev) => ({ ...prev, [`${index}-${field}`]: false }));
  };

  const getDateValue = (date: Date | undefined) => {
    if (date) {
      return parseDate(format(date, "yyyy-MM-dd"));
    }
    return null;
  };

  const formatDate = (date: Date | undefined, placeholder: string) => {
    if (date) {
      return format(date, "dd/MM/yyyy");
    }
    return placeholder;
  };

  const togglePopover = (key: string, isOpen: boolean) => {
    setOpenPopovers((prev) => ({ ...prev, [key]: isOpen }));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label className="text-sm font-medium">Destinations & Dates</Label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={addDestination}
          className="h-6 px-2"
        >
          <Plus size={12} className="mr-1" />
          Add
        </Button>
      </div>
      <div className="space-y-3">
        {destinations.map((destination, index) => (
          <div key={index} className="border rounded-lg p-3 bg-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Destination {index + 1}
              </span>
              {destinations.length > 1 && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => removeDestination(index)}
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                >
                  <X size={12} />
                </Button>
              )}
            </div>
            <div className="space-y-2">
              <Input
                placeholder="City name"
                value={destination.name}
                onChange={(e) =>
                  updateDestination(index, "name", e.target.value)
                }
                className="text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <Popover
                  open={openPopovers[`${index}-startDate`] || false}
                  onOpenChange={(isOpen) =>
                    togglePopover(`${index}-startDate`, isOpen)
                  }
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal text-xs h-8",
                        !destination.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      <span>{formatDate(destination.startDate, "Start")}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <JollyCalendar
                      value={getDateValue(destination.startDate)}
                      onChange={(date) =>
                        handleDateChange(index, "startDate", date)
                      }
                      minValue={today(getLocalTimeZone())}
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>

                <Popover
                  open={openPopovers[`${index}-endDate`] || false}
                  onOpenChange={(isOpen) =>
                    togglePopover(`${index}-endDate`, isOpen)
                  }
                >
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal text-xs h-8",
                        !destination.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      <span>{formatDate(destination.endDate, "End")}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <JollyCalendar
                      value={getDateValue(destination.endDate)}
                      onChange={(date) =>
                        handleDateChange(index, "endDate", date)
                      }
                      minValue={
                        destination.startDate
                          ? parseDate(
                              format(
                                addDays(destination.startDate, 1),
                                "yyyy-MM-dd"
                              )
                            )
                          : today(getLocalTimeZone())
                      }
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Calculated trip dates */}
      {calculatedDates && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-3">
          <div className="flex items-center space-x-2">
            <Calendar size={16} className="text-green-600" />
            <span className="text-sm font-medium text-green-800">
              Total Trip Duration
            </span>
          </div>
          <p className="text-sm text-green-700 mt-1">{calculatedDates}</p>
        </div>
      )}
    </div>
  );
};

export default DestinationForm;
