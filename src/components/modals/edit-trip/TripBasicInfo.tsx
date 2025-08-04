import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TripBasicInfoProps {
  tripName: string;
  onTripNameChange: (name: string) => void;
  travelers: string;
  onTravelersChange: (travelers: string) => void;
  status: string;
  onStatusChange: (status: string) => void;
  budget: string;
  onBudgetChange: (budget: string) => void;
  description: string;
  onDescriptionChange: (description: string) => void;
}

const TripBasicInfo = ({
  tripName,
  onTripNameChange,
  travelers,
  onTravelersChange,
  status,
  onStatusChange,
  budget,
  onBudgetChange,
  description,
  onDescriptionChange,
}: TripBasicInfoProps) => {
  return (
    <div className="space-y-3">
      <div>
        <Label htmlFor="tripName" className="text-sm font-medium">
          Trip Name
        </Label>
        <Input
          id="tripName"
          placeholder="My Amazing Trip"
          value={tripName}
          onChange={(e) => onTripNameChange(e.target.value)}
          className="mt-1"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="travelers" className="text-sm font-medium">
            Travelers
          </Label>
          <Input
            id="travelers"
            type="number"
            min="1"
            value={travelers}
            onChange={(e) => onTravelersChange(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="status" className="text-sm font-medium">
            Status
          </Label>
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planning">Planning</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="budget" className="text-sm font-medium">
          Budget
        </Label>
        <Input
          id="budget"
          type="number"
          placeholder="2500"
          value={budget}
          onChange={(e) => onBudgetChange(e.target.value)}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="description" className="text-sm font-medium">
          Description
        </Label>
        <textarea
          id="description"
          className="w-full mt-1 p-2 border rounded-md text-sm resize-none"
          rows={3}
          placeholder="Describe your trip..."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default TripBasicInfo;
