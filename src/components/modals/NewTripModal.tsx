
import { useState } from "react";
import { X, MapPin, Calendar, Users, Plane } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

interface NewTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTrip: (tripData: any) => void;
}

const NewTripModal = ({ isOpen, onClose, onCreateTrip }: NewTripModalProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    destination: "",
    startDate: "",
    endDate: "",
    travelers: 1,
    budget: "",
    description: "",
    isGroupTrip: false,
    accommodation: "",
    transportation: "",
    datesNotSet: false
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNotSureYet = () => {
    setFormData(prev => ({
      ...prev,
      startDate: "",
      endDate: "",
      datesNotSet: true
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.destination) {
      toast({
        title: "Missing Information",
        description: "Please fill in the trip name and destination.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.datesNotSet && (!formData.startDate || !formData.endDate)) {
      toast({
        title: "Missing Dates",
        description: "Please select dates or click 'Not sure yet' to continue without dates.",
        variant: "destructive"
      });
      return;
    }

    const newTrip = {
      id: Date.now(),
      name: formData.name,
      destination: formData.destination,
      dates: formData.datesNotSet 
        ? "Dates TBD" 
        : `${new Date(formData.startDate).toLocaleDateString()} - ${new Date(formData.endDate).toLocaleDateString()}`,
      status: "planning",
      travelers: formData.travelers,
      image: "🌍",
      isGroupTrip: formData.isGroupTrip,
      description: formData.description,
      budget: formData.budget,
      accommodation: formData.accommodation,
      transportation: formData.transportation,
      coordinates: [],
      datesNotSet: formData.datesNotSet,
      ...(formData.isGroupTrip && {
        collaborators: [
          { id: "1", name: "You", email: "you@example.com", avatar: "YO", role: "owner" as const }
        ]
      })
    };

    onCreateTrip(newTrip);
    
    toast({
      title: "Trip Created!",
      description: `${formData.name} has been added to your trips.`
    });

    // Reset form
    setFormData({
      name: "",
      destination: "",
      startDate: "",
      endDate: "",
      travelers: 1,
      budget: "",
      description: "",
      isGroupTrip: false,
      accommodation: "",
      transportation: "",
      datesNotSet: false
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-gray-800 flex items-center justify-center gap-2">
            <Plane className="text-blue-600" size={24} />
            Create New Trip
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Basic Information</h3>
            
            <div>
              <Label htmlFor="tripName" className="text-sm font-medium">
                Trip Name *
              </Label>
              <Input
                id="tripName"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g., European Adventure"
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="destination" className="text-sm font-medium flex items-center gap-1">
                <MapPin size={16} />
                Destination *
              </Label>
              <Input
                id="destination"
                value={formData.destination}
                onChange={(e) => handleInputChange("destination", e.target.value)}
                placeholder="e.g., Paris → Rome → Barcelona"
                className="mt-1"
                required
              />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium flex items-center gap-1">
                <Calendar size={16} />
                Travel Dates
              </Label>
              
              {formData.datesNotSet ? (
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700 mb-2">Dates will be decided later</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleInputChange("datesNotSet", false)}
                    className="text-blue-600 border-blue-300"
                  >
                    Set Dates Now
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate" className="text-sm font-medium">
                        Start Date
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => handleInputChange("startDate", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate" className="text-sm font-medium">
                        End Date
                      </Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => handleInputChange("endDate", e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleNotSureYet}
                    className="w-full text-gray-600 border-gray-300 hover:bg-gray-50"
                  >
                    Not sure yet
                  </Button>
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="travelers" className="text-sm font-medium flex items-center gap-1">
                <Users size={16} />
                Number of Travelers
              </Label>
              <Input
                id="travelers"
                type="number"
                min="1"
                value={formData.travelers}
                onChange={(e) => handleInputChange("travelers", parseInt(e.target.value))}
                className="mt-1"
              />
            </div>
          </div>

          {/* Group Trip Toggle */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <Label htmlFor="groupTrip" className="text-sm font-medium">
                Group Trip
              </Label>
              <p className="text-xs text-gray-600">Allow others to collaborate on this trip</p>
            </div>
            <Switch
              id="groupTrip"
              checked={formData.isGroupTrip}
              onCheckedChange={(checked) => handleInputChange("isGroupTrip", checked)}
            />
          </div>

          {/* Trip Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-700">Trip Details</h3>
            
            <div>
              <Label htmlFor="budget" className="text-sm font-medium">
                Budget (optional)
              </Label>
              <Input
                id="budget"
                value={formData.budget}
                onChange={(e) => handleInputChange("budget", e.target.value)}
                placeholder="e.g., $3,500 per person"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="accommodation" className="text-sm font-medium">
                Accommodation Preferences (optional)
              </Label>
              <Input
                id="accommodation"
                value={formData.accommodation}
                onChange={(e) => handleInputChange("accommodation", e.target.value)}
                placeholder="e.g., Hotels, Airbnb, Hostels"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="transportation" className="text-sm font-medium">
                Transportation (optional)
              </Label>
              <Input
                id="transportation"
                value={formData.transportation}
                onChange={(e) => handleInputChange("transportation", e.target.value)}
                placeholder="e.g., Flights, Train, Car rental"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description" className="text-sm font-medium">
                Description (optional)
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Tell us about your trip plans..."
                className="mt-1 min-h-[100px]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-blue-500 to-orange-500"
            >
              Create Trip
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewTripModal;
