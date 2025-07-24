import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Building, MapPin, Camera, Utensils, CalendarIcon } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface CityBreakModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTrip?: (tripData: any) => void;
}

const CityBreakModal = ({
  isOpen,
  onClose,
  onCreateTrip,
}: CityBreakModalProps) => {
  const [tripName, setTripName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [travelers, setTravelers] = useState("2");
  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const formatTripDates = () => {
    if (startDate && endDate) {
      const startFormatted = format(startDate, "MMM d, yyyy");
      const endFormatted = format(endDate, "MMM d, yyyy");
      return `${startFormatted} - ${endFormatted}`;
    }
    return "Dates TBD";
  };

  const handleStartDateSelect = (date: Date | undefined) => {
    setStartDate(date);
    if (date) {
      setStartDateOpen(false);
    }
  };

  const handleEndDateSelect = (date: Date | undefined) => {
    setEndDate(date);
    if (date) {
      setEndDateOpen(false);
    }
  };

  const handleSubmit = () => {
    if (onCreateTrip) {
      onCreateTrip({
        id: Date.now(),
        name: tripName || "City Break",
        destination: destination || "Urban Adventure",
        dates: formatTripDates(),
        status: "planning",
        travelers: parseInt(travelers),
        image: "🏛️",
        isGroupTrip: false,
        coordinates: [
          {
            name: destination || "City Destination",
            lat: 40.7128,
            lng: -74.006,
          },
        ],
      });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="text-4xl mb-2">🏛️</div>
          <DialogTitle className="text-xl font-bold text-gray-800">
            City Break
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Discover urban culture and attractions
          </p>
        </DialogHeader>

        <div className="space-y-4 p-1">
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Building className="text-purple-600" size={20} />
                <span>City Highlights</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2 text-sm">
                  <MapPin className="text-red-500" size={16} />
                  <span>Museums</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Building className="text-gray-600" size={16} />
                  <span>Architecture</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Utensils className="text-orange-500" size={16} />
                  <span>Local cuisine</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Camera className="text-blue-500" size={16} />
                  <span>City tours</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div>
              <Label htmlFor="tripName" className="text-sm font-medium">
                Trip Name
              </Label>
              <Input
                id="tripName"
                placeholder="City Exploration"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="destination" className="text-sm font-medium">
                City Destination
              </Label>
              <Input
                id="destination"
                placeholder="Paris, New York, Tokyo..."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium">Start Date</Label>
                <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? (
                        format(startDate, "MMM d")
                      ) : (
                        <span>Pick date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={startDate}
                      onSelect={handleStartDateSelect}
                      initialFocus
                      className="p-3 pointer-events-auto"
                      onClose={() => setStartDateOpen(false)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label className="text-sm font-medium">End Date</Label>
                <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal mt-1",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? (
                        format(endDate, "MMM d")
                      ) : (
                        <span>Pick date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={endDate}
                      onSelect={handleEndDateSelect}
                      disabled={(date) =>
                        startDate ? date < startDate : false
                      }
                      initialFocus
                      className="p-3 pointer-events-auto"
                      onClose={() => setEndDateOpen(false)}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div>
              <Label htmlFor="travelers" className="text-sm font-medium">
                Travelers
              </Label>
              <Input
                id="travelers"
                type="number"
                min="1"
                value={travelers}
                onChange={(e) => setTravelers(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-0">
            <CardContent className="p-4">
              <h4 className="font-medium text-gray-800 mb-2">
                City Experiences
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <span>• Art galleries</span>
                <span>• Shopping</span>
                <span>• Nightlife</span>
                <span>• Food tours</span>
                <span>• Walking tours</span>
                <span>• Local markets</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500"
            >
              Create City Trip
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CityBreakModal;
