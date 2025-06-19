
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface TripTypeSelectorProps {
  tripType: 'round-trip' | 'one-way' | 'multi-city' | 'manual';
  setTripType: (type: 'round-trip' | 'one-way' | 'multi-city' | 'manual') => void;
}

const TripTypeSelector = ({ tripType, setTripType }: TripTypeSelectorProps) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Select Trip Type</h3>
      <RadioGroup value={tripType} onValueChange={(value) => setTripType(value as 'round-trip' | 'one-way' | 'multi-city' | 'manual')}>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="round-trip" id="round-trip" />
          <Label htmlFor="round-trip">Round Trip</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="one-way" id="one-way" />
          <Label htmlFor="one-way">One Way</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="multi-city" id="multi-city" />
          <Label htmlFor="multi-city">Multi-city</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="manual" id="manual" />
          <Label htmlFor="manual">Manual Flight</Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default TripTypeSelector;
