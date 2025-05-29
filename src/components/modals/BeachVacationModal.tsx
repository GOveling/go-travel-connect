
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, MapPin, Users, Sun, Waves, Umbrella, Camera } from "lucide-react";
import { useState } from "react";

interface BeachVacationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTrip?: (tripData: any) => void;
}

const BeachVacationModal = ({ isOpen, onClose, onCreateTrip }: BeachVacationModalProps) => {
  const [tripName, setTripName] = useState("");
  const [destination, setDestination] = useState("");
  const [dates, setDates] = useState("");
  const [travelers, setTravelers] = useState("2");

  const handleSubmit = () => {
    if (onCreateTrip) {
      onCreateTrip({
        id: Date.now(),
        name: tripName || "Beach Vacation",
        destination: destination || "Tropical Paradise",
        dates: dates || "Summer 2024",
        status: "planning",
        travelers: parseInt(travelers),
        image: "🏖️",
        isGroupTrip: false,
        coordinates: [{ name: destination || "Beach Destination", lat: 25.7617, lng: -80.1918 }]
      });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="text-4xl mb-2">🏖️</div>
          <DialogTitle className="text-xl font-bold text-gray-800">Beach Vacation</DialogTitle>
          <p className="text-sm text-gray-600">Plan your perfect beach getaway</p>
        </DialogHeader>

        <div className="space-y-4 p-1">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Sun className="text-orange-500" size={20} />
                <span>Beach Essentials</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Waves className="text-blue-500" size={16} />
                  <span>Ocean activities</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Umbrella className="text-red-500" size={16} />
                  <span>Beach relaxation</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Sun className="text-yellow-500" size={16} />
                  <span>Sunbathing</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Camera className="text-purple-500" size={16} />
                  <span>Sunset photos</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div>
              <Label htmlFor="tripName" className="text-sm font-medium">Trip Name</Label>
              <Input
                id="tripName"
                placeholder="My Beach Vacation"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="destination" className="text-sm font-medium">Beach Destination</Label>
              <Input
                id="destination"
                placeholder="Maldives, Hawaii, Bali..."
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="dates" className="text-sm font-medium">Dates</Label>
                <Input
                  id="dates"
                  placeholder="Jul 15-22, 2024"
                  value={dates}
                  onChange={(e) => setDates(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="travelers" className="text-sm font-medium">Travelers</Label>
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
          </div>

          <Card className="bg-gradient-to-r from-blue-50 to-orange-50 border-0">
            <CardContent className="p-4">
              <h4 className="font-medium text-gray-800 mb-2">Popular Beach Activities</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <span>• Snorkeling</span>
                <span>• Beach volleyball</span>
                <span>• Surfing lessons</span>
                <span>• Sunset cruises</span>
                <span>• Water sports</span>
                <span>• Beach dining</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-blue-500 to-orange-500"
            >
              Create Beach Trip
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BeachVacationModal;
