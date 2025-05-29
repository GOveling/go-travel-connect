
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Backpack, Compass, Map, Tent } from "lucide-react";
import { useState } from "react";

interface BackpackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTrip?: (tripData: any) => void;
}

const BackpackingModal = ({ isOpen, onClose, onCreateTrip }: BackpackingModalProps) => {
  const [tripName, setTripName] = useState("");
  const [destination, setDestination] = useState("");
  const [dates, setDates] = useState("");
  const [travelers, setTravelers] = useState("1");

  const handleSubmit = () => {
    if (onCreateTrip) {
      onCreateTrip({
        id: Date.now(),
        name: tripName || "Backpacking Adventure",
        destination: destination || "Adventure Trail",
        dates: dates || "Spring 2024",
        status: "planning",
        travelers: parseInt(travelers),
        image: "🎒",
        isGroupTrip: false,
        coordinates: [{ name: destination || "Backpacking Destination", lat: 47.3769, lng: 8.5417 }]
      });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="text-4xl mb-2">🎒</div>
          <DialogTitle className="text-xl font-bold text-gray-800">Backpacking</DialogTitle>
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
              <Label htmlFor="tripName" className="text-sm font-medium">Trip Name</Label>
              <Input
                id="tripName"
                placeholder="Solo Backpacking Trip"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="destination" className="text-sm font-medium">Backpacking Route</Label>
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
                <Label htmlFor="dates" className="text-sm font-medium">Dates</Label>
                <Input
                  id="dates"
                  placeholder="Jun 1 - Aug 30, 2024"
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

          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-0">
            <CardContent className="p-4">
              <h4 className="font-medium text-gray-800 mb-2">Backpacking Tips</h4>
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
