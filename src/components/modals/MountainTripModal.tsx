
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mountain, Compass, Camera, TreePine } from "lucide-react";
import { useState } from "react";

interface MountainTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTrip?: (tripData: any) => void;
}

const MountainTripModal = ({ isOpen, onClose, onCreateTrip }: MountainTripModalProps) => {
  const [tripName, setTripName] = useState("");
  const [destination, setDestination] = useState("");
  const [dates, setDates] = useState("");
  const [travelers, setTravelers] = useState("2");

  const handleSubmit = () => {
    if (onCreateTrip) {
      onCreateTrip({
        id: Date.now(),
        name: tripName || "Mountain Adventure",
        destination: destination || "Mountain Range",
        dates: dates || "Fall 2024",
        status: "planning",
        travelers: parseInt(travelers),
        image: "🏔️",
        isGroupTrip: false,
        coordinates: [{ name: destination || "Mountain Destination", lat: 46.5197, lng: 7.7419 }]
      });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="text-4xl mb-2">🏔️</div>
          <DialogTitle className="text-xl font-bold text-gray-800">Mountain Trip</DialogTitle>
          <p className="text-sm text-gray-600">Explore majestic peaks and trails</p>
        </DialogHeader>

        <div className="space-y-4 p-1">
          <Card className="bg-green-50 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <Mountain className="text-green-600" size={20} />
                <span>Mountain Adventures</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2 text-sm">
                  <Compass className="text-blue-500" size={16} />
                  <span>Hiking trails</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <TreePine className="text-green-500" size={16} />
                  <span>Nature walks</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Mountain className="text-gray-600" size={16} />
                  <span>Peak climbing</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Camera className="text-purple-500" size={16} />
                  <span>Scenic views</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <div>
              <Label htmlFor="tripName" className="text-sm font-medium">Trip Name</Label>
              <Input
                id="tripName"
                placeholder="Mountain Adventure"
                value={tripName}
                onChange={(e) => setTripName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="destination" className="text-sm font-medium">Mountain Destination</Label>
              <Input
                id="destination"
                placeholder="Alps, Rockies, Himalayas..."
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
                  placeholder="Sep 10-17, 2024"
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

          <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-0">
            <CardContent className="p-4">
              <h4 className="font-medium text-gray-800 mb-2">Mountain Activities</h4>
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <span>• Rock climbing</span>
                <span>• Alpine skiing</span>
                <span>• Mountain biking</span>
                <span>• Wildlife watching</span>
                <span>• Camping</span>
                <span>• Photography</span>
              </div>
            </CardContent>
          </Card>

          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              className="flex-1 bg-gradient-to-r from-green-500 to-blue-500"
            >
              Create Mountain Trip
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MountainTripModal;
