import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CalendarDate } from "@internationalized/date";

export interface NewTripFormData {
  name: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  budget: number;
  description: string;
  accommodation: string[];
  transportation: string[];
  datesNotSet: boolean;
}

export const useNewTripForm = (
  onCreateTrip: (tripData: any) => void,
  onClose: () => void
) => {
  const { toast } = useToast();
  const [nameError, setNameError] = useState(false);
  const [formData, setFormData] = useState<NewTripFormData>({
    name: "",
    startDate: undefined,
    endDate: undefined,
    budget: 0,
    description: "",
    accommodation: [],
    transportation: [],
    datesNotSet: false,
  });

  const handleInputChange = (field: keyof NewTripFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    handleInputChange("name", value);

    if (value.trim() && nameError) {
      setNameError(false);
    }
  };

  const handleDateRangeChange = (
    range: { start: CalendarDate | null; end: CalendarDate | null } | null
  ) => {
    if (range?.start && range?.end) {
      const startDate = new Date(
        range.start.year,
        range.start.month - 1,
        range.start.day
      );
      const endDate = new Date(
        range.end.year,
        range.end.month - 1,
        range.end.day
      );
      setFormData((prev) => ({
        ...prev,
        startDate,
        endDate,
        datesNotSet: false,
      }));
    } else if (range?.start) {
      const startDate = new Date(
        range.start.year,
        range.start.month - 1,
        range.start.day
      );
      setFormData((prev) => ({
        ...prev,
        startDate,
        endDate: undefined,
        datesNotSet: false,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        startDate: undefined,
        endDate: undefined,
      }));
    }
  };

  const handleNotSureYet = () => {
    setFormData((prev) => ({
      ...prev,
      startDate: undefined,
      endDate: undefined,
      datesNotSet: true,
    }));
  };

  const formatTripDates = () => {
    if (formData.datesNotSet) {
      return "Dates TBD";
    }
    if (formData.startDate && formData.endDate) {
      const startFormatted = format(formData.startDate, "MMM d, yyyy");
      const endFormatted = format(formData.endDate, "MMM d, yyyy");
      return `${startFormatted} - ${endFormatted}`;
    }
    return "Dates TBD";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setNameError(true);
      return;
    }

    const newTrip = {
      id: Date.now(),
      name: formData.name,
      destination: "To be defined",
      dates: formatTripDates(),
      startDate: formData.startDate,
      endDate: formData.endDate,
      status: "planning",
      travelers: 1,
      image: "🌍",
      isGroupTrip: false,
      description: formData.description,
      budget: formData.budget.toString(),
      accommodation: formData.accommodation.join(", "),
      transportation: formData.transportation.join(", "),
      coordinates: [],
      datesNotSet: formData.datesNotSet,
    };

    onCreateTrip(newTrip);

    toast({
      title: "Trip Created!",
      description: `${formData.name} has been added to your trips.`,
    });

    // Reset form
    setFormData({
      name: "",
      startDate: undefined,
      endDate: undefined,
      budget: 0,
      description: "",
      accommodation: [],
      transportation: [],
      datesNotSet: false,
    });

    // Reset validation states
    setNameError(false);

    onClose();
  };

  return {
    formData,
    nameError,
    handleInputChange,
    handleNameChange,
    handleDateRangeChange,
    handleNotSureYet,
    handleSubmit,
  };
};
