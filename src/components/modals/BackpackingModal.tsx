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
import { Backpack, Compass, Map, Tent, CalendarIcon } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface BackpackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTrip?: (tripData: any) => void;
}

const BackpackingModal = ({
  isOpen,
  onClose,
  onCreateTrip,
}: BackpackingModalProps) => {
  const [tripName, setTripName] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [travelers, setTravelers] = useState("1");

  const formatTripDates = () => {
    if (startDate && endDate) {
      const startFormatted = format(startDate, "MMM d, yyyy");
      const endFormatted = format(endDate, "MMM d, yyyy");
      return `${startFormatted} - ${endFormatted}`;
    }
    return "Dates TBD";
  };

  const handleSubmit = () => {
    if (onCreateTrip) {
      onCreateTrip({
        id: Date.now(),
        name: tripName || "Backpacking Adventure",
        destination: destination || "Adventure Trail",
        dates: formatTripDates(),
        status: "planning",
        travelers: parseInt(travelers),
        image: "🎒",
        isGroupTrip: false,
        coordinates: [
          {
            name: destination || "Backpacking Destination",
            lat: 47.3769,
            lng: 8.5417,
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
          <div className="text-4xl mb-2">🎒</div>
          <DialogTitle className="text-xl font-bold text-gray-800">
            Backpacking
          </DialogTitle>
          <p className="text-sm text-gray-600">Epic adventure on a budget</p>
        </DialogHeader>

        <div className="space-y-4 p-1">
          <Card className="bg-orange-50 border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Backpack className="text-orange-600" size={20} />
                <span>Adventure Essentials</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Tent className="text-green-500" size={16} />
                  <span>Camping</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Compass className="text-blue-500" size={16} />
                  <span>Navigation</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Map className="text-purple-500" size={16} />
                  <span>Trail maps</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Backpack className="text-brown-500" size={16} />
                  <span>Light packing</span>
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
                placeholder="Solo Backpacking Trip"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="destination" className="text-sm font-medium">
                Backpacking Route
              </Label>
              <Input
                id="destination"
                placeholder="Europe, Southeast Asia, South America..."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-medium">Start Date</Label>
                <Popover>
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
                      onSelect={setStartDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div>
                <Label className="text-sm font-medium">End Date</Label>
                <Popover>
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
                      onSelect={setEndDate}
                      disabled={(date) =>
                        startDate ? date < startDate : false
                      }
                      initialFocus
                      className="p-3 pointer-events-auto"
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

          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-0">
            <CardContent className="p-4">
              <h4 className="font-medium text-gray-800 mb-2">
                Backpacking Tips
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <span>• Pack light</span>
                <span>• Budget hostels</span>
                <span>• Local transport</span>
                <span>• Street food</span>
                <span>• Free activities</span>
                <span>• Meet locals</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-500"
            >
              Create Backpacking Trip
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BackpackingModal;
