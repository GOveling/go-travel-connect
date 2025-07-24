import { Route } from "lucide-react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trip } from "@/types/aiSmartRoute";

interface TripSelectorProps {
  selectedTripId: string;
  trips: Trip[];
  onTripSelection: (tripId: string) => void;
}

const TripSelector = ({
  selectedTripId,
  trips,
  onTripSelection,
}: TripSelectorProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="tripSelection">Select from My Trips (Optional)</Label>
      <div className="relative">
        <Route size={16} className="absolute left-3 top-3 text-gray-400" />
        <Select value={selectedTripId} onValueChange={onTripSelection}>
          <SelectTrigger className="pl-10">
            <SelectValue placeholder="Choose a trip to auto-fill details" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="manual">Manual entry</SelectItem>
            {trips.map((trip) => (
              <SelectItem key={trip.id} value={trip.id.toString()}>
                <div className="flex flex-col">
                  <span className="font-medium">{trip.name}</span>
                  <span className="text-xs text-gray-500">
                    {trip.destination} • {trip.dates}
                    {trip.coordinates && trip.coordinates.length > 1 && (
                      <span className="ml-1 text-green-600">
                        ({trip.coordinates.length} destinations)
                      </span>
                    )}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default TripSelector;
