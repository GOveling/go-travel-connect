
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DateSelectionForm from "./DateSelectionForm";

interface FormData {
  from: string;
  to: string;
  departDate: string;
  returnDate: string;
  passengers: number;
  class: string;
}

interface RegularFlightFormProps {
  tripType: 'round-trip' | 'one-way' | 'multi-city';
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
  isDateRangeOpen: boolean;
  setIsDateRangeOpen: (open: boolean) => void;
  isDepartDateOpen: boolean;
  setIsDepartDateOpen: (open: boolean) => void;
}

const RegularFlightForm = ({ 
  tripType, 
  formData, 
  setFormData,
  isDateRangeOpen,
  setIsDateRangeOpen,
  isDepartDateOpen,
  setIsDepartDateOpen
}: RegularFlightFormProps) => {
  const updateFormData = (field: keyof FormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="from">From</Label>
          <Input
            id="from"
            value={formData.from}
            onChange={(e) => updateFormData('from', e.target.value)}
            placeholder="Departure city"
          />
        </div>
        <div>
          <Label htmlFor="to">To</Label>
          <Input
            id="to"
            value={formData.to}
            onChange={(e) => updateFormData('to', e.target.value)}
            placeholder="Destination city"
          />
        </div>
      </div>

      <DateSelectionForm
        tripType={tripType}
        formData={formData}
        setFormData={setFormData}
        isDateRangeOpen={isDateRangeOpen}
        setIsDateRangeOpen={setIsDateRangeOpen}
        isDepartDateOpen={isDepartDateOpen}
        setIsDepartDateOpen={setIsDepartDateOpen}
      />

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="passengers">Passengers</Label>
          <Select value={formData.passengers.toString()} onValueChange={(value) => updateFormData('passengers', parseInt(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                <SelectItem key={num} value={num.toString()}>{num} passenger{num > 1 ? 's' : ''}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="class">Class</Label>
          <Select value={formData.class} onValueChange={(value) => updateFormData('class', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="economy">Economy</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="first">First Class</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default RegularFlightForm;
