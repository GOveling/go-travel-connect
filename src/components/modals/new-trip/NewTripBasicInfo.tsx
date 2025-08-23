import { AlertTriangle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import NewTripDatePicker from "./NewTripDatePicker";
import { NewTripFormData } from "@/hooks/useNewTripForm";
import { CalendarDate } from "@internationalized/date";

interface NewTripBasicInfoProps {
  formData: NewTripFormData;
  nameError: boolean;
  onNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onInputChange: (field: keyof NewTripFormData, value: any) => void;
  onDateRangeChange: (
    range: { start: CalendarDate | null; end: CalendarDate | null } | null
  ) => void;
  onNotSureYet: () => void;
}

const NewTripBasicInfo = ({
  formData,
  nameError,
  onNameChange,
  onInputChange,
  onDateRangeChange,
  onNotSureYet,
}: NewTripBasicInfoProps) => {
  const handleSetDatesNow = () => {
    onInputChange("datesNotSet", false);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700">Basic Information</h3>

      <div>
        <Label htmlFor="tripName" className="text-sm font-medium">
          Trip Name *
        </Label>
        <Input
          id="tripName"
          value={formData.name}
          onChange={onNameChange}
          placeholder="e.g., European Adventure"
          className={cn(
            "mt-1 transition-all duration-200",
            nameError && "border-destructive focus-visible:ring-destructive"
          )}
        />
        {nameError && (
          <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-destructive/10 border border-destructive/20 rounded-md animate-fade-in">
            <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0" />
            <span className="text-sm font-medium text-destructive">
              Trip name is required to continue
            </span>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="description" className="text-sm font-medium">
          Description (optional)
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => onInputChange("description", e.target.value)}
          placeholder="Tell us about your trip plans..."
          className="mt-1 min-h-[100px]"
          maxLength={250}
        />
      </div>

      <NewTripDatePicker
        startDate={formData.startDate}
        endDate={formData.endDate}
        datesNotSet={formData.datesNotSet}
        onDateRangeChange={onDateRangeChange}
        onNotSureYet={onNotSureYet}
        onSetDatesNow={handleSetDatesNow}
      />
    </div>
  );
};

export default NewTripBasicInfo;
