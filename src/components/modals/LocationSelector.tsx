
import { useState } from "react";
import { MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Trip {
  id: number;
  name: string;
  destination: string;
}

interface LocationSelectorProps {
  onLocationSelected: (location: string, tripId?: number) => void;
  trips?: Trip[];
}

const LocationSelector = ({ onLocationSelected, trips = [] }: LocationSelectorProps) => {
  const [location, setLocation] = useState("");
  const [selectedTripId, setSelectedTripId] = useState<number | undefined>();
  const [showTripSelection, setShowTripSelection] = useState(false);

  const handleLocationSubmit = () => {
    if (location.trim()) {
      onLocationSelected(location.trim(), selectedTripId);
      setLocation("");
      setSelectedTripId(undefined);
      setShowTripSelection(false);
    }
  };

  const defaultTrips = [
    { id: 1, name: "European Adventure", destination: "Paris → Rome → Barcelona" },
    { id: 2, name: "Tokyo Discovery", destination: "Tokyo, Japan" },
    { id: 3, name: "Bali Retreat", destination: "Bali, Indonesia" }
  ];

  const availableTrips = trips.length > 0 ? trips : defaultTrips;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
          <MapPin size={16} />
          Location where photo was taken:
        </label>
        <Input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g., Eiffel Tower, Paris, France"
          className="w-full"
        />
      </div>

      {location.trim() && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Add to trip (optional):</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowTripSelection(!showTripSelection)}
              className="text-blue-600 hover:bg-blue-50"
            >
              <Plus size={16} className="mr-1" />
              {showTripSelection ? "Cancel" : "Add to Trip"}
            </Button>
          </div>

          {showTripSelection && (
            <Card className="border-2 border-blue-100">
              <CardContent className="p-3">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Select a trip:</p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {availableTrips.map((trip) => (
                      <div
                        key={trip.id}
                        className={`p-2 rounded border cursor-pointer transition-colors ${
                          selectedTripId === trip.id
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                        onClick={() => setSelectedTripId(selectedTripId === trip.id ? undefined : trip.id)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm font-medium">{trip.name}</p>
                            <p className="text-xs text-gray-500">{trip.destination}</p>
                          </div>
                          {selectedTripId === trip.id && (
                            <Badge variant="default" className="bg-blue-600">
                              Selected
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            onClick={handleLocationSubmit}
            className="w-full bg-gradient-to-r from-purple-600 to-orange-500"
          >
            <MapPin size={16} className="mr-2" />
            Confirm Location
          </Button>
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
