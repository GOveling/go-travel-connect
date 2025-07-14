import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import MultiSelectPopover from "./MultiSelectPopover";
import { NewTripFormData } from "@/hooks/useNewTripForm";
import { accommodationOptions, transportationOptions } from "./constants";

interface NewTripDetailsProps {
  formData: NewTripFormData;
  onInputChange: (field: keyof NewTripFormData, value: any) => void;
}

const NewTripDetails = ({
  formData,
  onInputChange
}: NewTripDetailsProps) => {
  const handleAccommodationSelect = (item: string) => {
    if (!formData.accommodation.includes(item)) {
      onInputChange("accommodation", [...formData.accommodation, item]);
    }
  };

  const handleAccommodationRemove = (item: string) => {
    onInputChange("accommodation", formData.accommodation.filter(a => a !== item));
  };

  const handleTransportationSelect = (item: string) => {
    if (!formData.transportation.includes(item)) {
      onInputChange("transportation", [...formData.transportation, item]);
    }
  };

  const handleTransportationRemove = (item: string) => {
    onInputChange("transportation", formData.transportation.filter(t => t !== item));
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-700">Trip Details</h3>
      
      <div>
        <Label htmlFor="budget" className="text-sm font-medium">
          Budget (optional)
        </Label>
        <Input
          id="budget"
          type="number"
          min="0"
          value={formData.budget || ""}
          onChange={(e) => {
            const value = e.target.value;
            onInputChange("budget", value === "" ? "" : parseFloat(value) || "");
          }}
          placeholder="Enter budget amount"
          className="mt-1"
        />
      </div>

      <MultiSelectPopover
        label="Accommodation Preferences (optional)"
        options={accommodationOptions}
        selectedItems={formData.accommodation}
        onItemSelect={handleAccommodationSelect}
        onItemRemove={handleAccommodationRemove}
        placeholder="Select accommodation types"
      />

      <MultiSelectPopover
        label="Transportation (optional)"
        options={transportationOptions}
        selectedItems={formData.transportation}
        onItemSelect={handleTransportationSelect}
        onItemRemove={handleTransportationRemove}
        placeholder="Select transportation types"
      />
    </div>
  );
};

export default NewTripDetails;