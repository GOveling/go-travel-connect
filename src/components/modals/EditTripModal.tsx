
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, MapPin, Users, Edit3, Save, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

interface EditTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip?: any;
  onUpdateTrip?: (tripData: any) => void;
  onDeleteTrip?: (tripId: number) => void;
}

const EditTripModal = ({ isOpen, onClose, trip, onUpdateTrip, onDeleteTrip }: EditTripModalProps) => {
  const [tripName, setTripName] = useState("");
  const [destination, setDestination] = useState("");
  const [dates, setDates] = useState("");
  const [travelers, setTravelers] = useState("1");
  const [status, setStatus] = useState("planning");
  const [budget, setBudget] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (trip) {
      setTripName(trip.name || "");
      setDestination(trip.destination || "");
      setDates(trip.dates || "");
      setTravelers(trip.travelers?.toString() || "1");
      setStatus(trip.status || "planning");
      setBudget(trip.budget || "");
      setDescription(trip.description || "");
    }
  }, [trip]);

  const handleSave = () => {
    if (onUpdateTrip && trip) {
      onUpdateTrip({
        ...trip,
        name: tripName,
        destination: destination,
        dates: dates,
        travelers: parseInt(travelers),
        status: status,
        budget: budget,
        description: description
      });
    }
    onClose();
  };

  const handleDelete = () => {
    if (onDeleteTrip && trip) {
      onDeleteTrip(trip.id);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <div className="text-4xl mb-2">{trip?.image || "✈️"}</div>
          <DialogTitle className="text-xl font-bold text-gray-800 flex items-center justify-center space-x-2">
            <Edit3 size={20} />
            <span>Edit Trip</span>
          </DialogTitle>
          <p className="text-sm text-gray-600">Update your trip details</p>
        </DialogHeader>

        <div className="space-y-4 p-1">
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2">
                <MapPin className="text-blue-600" size={20} />
                <span>Trip Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="tripName" className="text-sm font-medium">Trip Name</Label>
                <Input
                  id="tripName"
                  placeholder="My Amazing Trip"
                  value={tripName}
                  onChange={(e) => setTripName(e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="destination" className="text-sm font-medium">Destination</Label>
                <Input
                  id="destination"
                  placeholder="Paris, Tokyo, New York..."
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
                    placeholder="Dec 15-25, 2024"
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
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
                <div>
                  <Label htmlFor="budget" className="text-sm font-medium">Budget</Label>
                  <Input
                    id="budget"
                    placeholder="$2,500 per person"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <textarea
                  id="description"
                  className="w-full mt-1 p-2 border rounded-md text-sm resize-none"
                  rows={3}
                  placeholder="Describe your trip..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-red-50 border-red-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center space-x-2 text-red-700">
                <Trash2 className="text-red-600" size={20} />
                <span>Danger Zone</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-red-600 mb-3">
                Once you delete a trip, there is no going back. Please be certain.
              </p>
              <Button 
                variant="outline" 
                onClick={handleDelete}
                className="w-full border-red-300 text-red-600 hover:bg-red-50"
              >
                <Trash2 size={16} className="mr-2" />
                Delete Trip
              </Button>
            </CardContent>
          </Card>

          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="flex-1 bg-gradient-to-r from-blue-500 to-orange-500"
            >
              <Save size={16} className="mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditTripModal;
