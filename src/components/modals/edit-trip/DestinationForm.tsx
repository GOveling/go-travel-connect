
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Plus, X, Calendar } from "lucide-react";
import { addDays, format } from "date-fns";
import DestinationDatePicker from "./DestinationDatePicker";

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

const DestinationForm = ({ destinations, onDestinationsChange, calculatedDates }: DestinationFormProps) => {
  const addDestination = () => {
    onDestinationsChange([...destinations, { name: "", startDate: undefined, endDate: undefined }]);
  };

  const removeDestination = (index: number) => {
    if (destinations.length > 1) {
      onDestinationsChange(destinations.filter((_, i) => i !== index));
    }
  };

  const updateDestination = (index: number, field: string, value: string | Date | undefined) => {
    const updated = destinations.map((dest, i) => {
      if (i === index) {
        const updatedDest = { ...dest, [field]: value };
        
        // If updating start date, automatically set end date to next day if end date is not set or is before start date
        if (field === 'startDate' && value instanceof Date) {
          if (!updatedDest.endDate || updatedDest.endDate <= value) {
            updatedDest.endDate = addDays(value, 1);
          }
        }
        
        return updatedDest;
      }
      return dest;
    });
    onDestinationsChange(updated);
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
              <span className="text-sm font-medium text-gray-700">Destination {index + 1}</span>
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
                onChange={(e) => updateDestination(index, 'name', e.target.value)}
                className="text-sm"
              />
              <div className="grid grid-cols-2 gap-2">
                <DestinationDatePicker
                  date={destination.startDate}
                  onDateChange={(date) => updateDestination(index, 'startDate', date)}
                  placeholder="Start"
                />
                <DestinationDatePicker
                  date={destination.endDate}
                  onDateChange={(date) => updateDestination(index, 'endDate', date)}
                  placeholder="End"
                  disabled={(date) => destination.startDate ? date <= destination.startDate : false}
                />
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
            <span className="text-sm font-medium text-green-800">Total Trip Duration</span>
          </div>
          <p className="text-sm text-green-700 mt-1">{calculatedDates}</p>
        </div>
      )}
    </div>
  );
};

export default DestinationForm;
