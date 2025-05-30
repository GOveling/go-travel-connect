
import { MapPin, ArrowUpDown, MapPinIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Trip {
  id: number;
  name: string;
  destination: string;
  dates: string;
  image: string;
  coordinates?: Array<{ name: string; lat: number; lng: number }>;
}

interface FormData {
  from: string;
  to: string;
  departDate: string;
  returnDate: string;
  passengers: number;
  class: string;
}

interface TripSelectionStepProps {
  tripType: 'round-trip' | 'one-way';
  setTripType: (type: 'round-trip' | 'one-way') => void;
  selectedTrip: number | null;
  currentLocation: string;
  activeTrips: Trip[];
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
  onTripSelect: (tripId: number) => void;
  onContinue: () => void;
}

const TripSelectionStep = ({
  tripType,
  setTripType,
  selectedTrip,
  currentLocation,
  activeTrips,
  formData,
  setFormData,
  onTripSelect,
  onContinue
}: TripSelectionStepProps) => {
  return (
    <div className="space-y-4">
      <div>
        {/* Current Location Display */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 text-blue-800">
            <MapPinIcon size={16} />
            <span className="text-sm font-medium">Current Location</span>
          </div>
          <p className="text-sm text-blue-700 mt-1">{currentLocation}</p>
        </div>

        <h3 className="font-semibold mb-3">Select Trip or Create New</h3>
        
        {activeTrips.length > 0 && (
          <div className="space-y-2 mb-4">
            <Label className="text-sm text-gray-600">Your Active Trips (AI Auto-fill)</Label>
            {activeTrips.map((trip) => (
              <Card 
                key={trip.id}
                className={`cursor-pointer transition-all ${
                  selectedTrip === trip.id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'hover:border-gray-300'
                }`}
                onClick={() => onTripSelect(trip.id)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="text-xl">{trip.image}</div>
                      <div>
                        <p className="font-medium text-sm">{trip.name}</p>
                        <p className="text-xs text-gray-600">{trip.destination}</p>
                        <p className="text-xs text-gray-500">{trip.dates}</p>
                        {trip.coordinates && trip.coordinates.length > 0 && (
                          <p className="text-xs text-blue-600">
                            🤖 Route: {currentLocation} → {trip.coordinates[0].name}
                            {trip.coordinates.length > 1 && ` → ${trip.coordinates[trip.coordinates.length - 1].name}`}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant={selectedTrip === trip.id ? "default" : "outline"}>
                      {selectedTrip === trip.id ? 'Selected' : 'Auto-fill'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="space-y-3">
          <Label className="text-sm text-gray-600">Or Book Independently</Label>
          
          {/* Trip Type Selection */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={tripType === 'round-trip' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTripType('round-trip')}
              className="h-10"
            >
              Round Trip
            </Button>
            <Button
              variant={tripType === 'one-way' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTripType('one-way')}
              className="h-10"
            >
              One Way
            </Button>
          </div>

          {/* From/To Inputs */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="from" className="text-sm">From</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
                <Input
                  id="from"
                  placeholder="Departure city"
                  value={formData.from}
                  onChange={(e) => setFormData(prev => ({ ...prev, from: e.target.value }))}
                  className="pl-10 h-12"
                />
              </div>
            </div>

            <div className="flex justify-center">
              <Button variant="ghost" size="sm" className="p-2 rounded-full bg-gray-100">
                <ArrowUpDown size={16} />
              </Button>
            </div>

            <div>
              <Label htmlFor="to" className="text-sm">To</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
                <Input
                  id="to"
                  placeholder="Destination city"
                  value={formData.to}
                  onChange={(e) => setFormData(prev => ({ ...prev, to: e.target.value }))}
                  className="pl-10 h-12"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Button 
        onClick={onContinue}
        className="w-full h-12 bg-gradient-to-r from-blue-500 to-blue-600"
        disabled={!formData.from || !formData.to}
      >
        Continue
      </Button>
    </div>
  );
};

export default TripSelectionStep;
