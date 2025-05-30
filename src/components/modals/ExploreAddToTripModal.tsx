import { useState } from "react";
import { MapPin, Calendar, Plus, Check, Plane } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Trip } from "@/types/aiSmartRoute";

interface ExploreAddToTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlace: {
    name: string;
    location: string;
    rating: number;
    image: string;
    category: string;
    description?: string;
    lat?: number;
    lng?: number;
  } | null;
  existingTrips: Trip[];
  onAddToExistingTrip: (tripId: number, place: any) => void;
  onCreateNewTrip: (tripData: any) => void;
}

const ExploreAddToTripModal = ({ 
  isOpen, 
  onClose, 
  selectedPlace,
  existingTrips, 
  onAddToExistingTrip, 
  onCreateNewTrip
}: ExploreAddToTripModalProps) => {
  const { toast } = useToast();
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);
  const [showNewTripForm, setShowNewTripForm] = useState(false);
  const [newTripData, setNewTripData] = useState({
    name: "",
    dates: "",
    travelers: 1
  });

  if (!selectedPlace) return null;

  // Find trips with matching location
  const tripsWithMatchingLocation = existingTrips.filter(trip => 
    trip.destination.toLowerCase().includes(selectedPlace.location.toLowerCase()) ||
    trip.coordinates.some(coord => 
      coord.name.toLowerCase().includes(selectedPlace.location.toLowerCase())
    )
  );

  const handleAddToExistingTrip = () => {
    if (selectedTripId && selectedPlace) {
      onAddToExistingTrip(selectedTripId, selectedPlace);
      toast({
        title: "Place Added!",
        description: `${selectedPlace.name} has been added to your trip.`
      });
      onClose();
      resetForm();
    }
  };

  const handleCreateNewTrip = () => {
    if (!newTripData.name.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter a trip name.",
        variant: "destructive"
      });
      return;
    }

    const newTrip = {
      id: Date.now(),
      name: newTripData.name,
      destination: selectedPlace.location,
      dates: newTripData.dates || "Dates TBD",
      status: "planning",
      travelers: newTripData.travelers,
      image: selectedPlace.image,
      isGroupTrip: false,
      coordinates: [
        { 
          name: selectedPlace.location, 
          lat: selectedPlace.lat || 0, 
          lng: selectedPlace.lng || 0 
        }
      ],
      savedPlaces: [
        {
          id: Date.now().toString(),
          name: selectedPlace.name,
          category: selectedPlace.category,
          rating: selectedPlace.rating,
          image: selectedPlace.image,
          description: selectedPlace.description || "",
          estimatedTime: "2-3 hours",
          priority: "medium" as const,
          destinationName: selectedPlace.location,
          lat: selectedPlace.lat || 0,
          lng: selectedPlace.lng || 0
        }
      ]
    };

    onCreateNewTrip(newTrip);
    toast({
      title: "Trip Created!",
      description: `${newTripData.name} has been created with ${selectedPlace.name}.`
    });
    onClose();
    resetForm();
  };

  const resetForm = () => {
    setSelectedTripId(null);
    setShowNewTripForm(false);
    setNewTripData({ name: "", dates: "", travelers: 1 });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-green-100 text-green-800";
      case "planning":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center text-gray-800">
            Add to Trip
          </DialogTitle>
          <p className="text-sm text-gray-600 text-center flex items-center justify-center gap-1">
            <MapPin size={14} />
            {selectedPlace.name} in {selectedPlace.location}
          </p>
        </DialogHeader>
        
        <div className="space-y-4 px-1">
          {/* Show matching location trips first */}
          {tripsWithMatchingLocation.length > 0 && !showNewTripForm && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-green-700 flex items-center gap-1">
                <Check size={16} />
                Trips with matching location:
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {tripsWithMatchingLocation.map((trip) => (
                  <Card 
                    key={trip.id} 
                    className={`cursor-pointer transition-all duration-200 border-green-200 ${
                      selectedTripId === trip.id 
                        ? 'border-green-500 bg-green-50' 
                        : 'hover:border-green-300'
                    }`}
                    onClick={() => setSelectedTripId(trip.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                          <span className="text-lg">{trip.image}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-sm text-gray-800 truncate">{trip.name}</h4>
                            <span className={`text-xs px-2 py-1 rounded-full capitalize ${getStatusColor(trip.status)}`}>
                              {trip.status}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-1 text-xs text-gray-600">
                              <MapPin size={10} />
                              <span className="truncate">{trip.destination}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-xs text-gray-600">
                              <Calendar size={10} />
                              <span>{trip.dates}</span>
                            </div>
                          </div>
                        </div>
                        {selectedTripId === trip.id && (
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <Check size={12} className="text-white" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Other trips */}
          {existingTrips.filter(trip => !tripsWithMatchingLocation.includes(trip)).length > 0 && !showNewTripForm && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Or add to other trip:</h3>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {existingTrips.filter(trip => !tripsWithMatchingLocation.includes(trip)).map((trip) => (
                  <Card 
                    key={trip.id} 
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedTripId === trip.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedTripId(trip.id)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-orange-500 rounded-lg flex items-center justify-center">
                          <span className="text-sm">{trip.image}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-800 truncate">{trip.name}</h4>
                          <p className="text-xs text-gray-600 truncate">{trip.destination}</p>
                        </div>
                        {selectedTripId === trip.id && (
                          <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <Check size={10} className="text-white" />
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Create New Trip Option */}
          {!showNewTripForm ? (
            <Card className="border-2 border-dashed border-blue-300 hover:border-blue-400 cursor-pointer transition-colors">
              <CardContent className="p-4">
                <Button
                  onClick={() => setShowNewTripForm(true)}
                  variant="ghost"
                  className="w-full h-auto p-0 justify-start text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Plus size={20} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">Create New Trip</h3>
                      <p className="text-sm text-gray-600">Start a new adventure in {selectedPlace.location}</p>
                    </div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          ) : (
            /* New Trip Form */
            <Card className="border-blue-300">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-800 flex items-center gap-2">
                    <Plane size={16} className="text-blue-600" />
                    Create New Trip
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewTripForm(false)}
                    className="text-gray-500"
                  >
                    ✕
                  </Button>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="tripName" className="text-sm font-medium">
                      Trip Name *
                    </Label>
                    <Input
                      id="tripName"
                      value={newTripData.name}
                      onChange={(e) => setNewTripData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder={`Adventure in ${selectedPlace.location}`}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="dates" className="text-sm font-medium">
                      Dates (optional)
                    </Label>
                    <Input
                      id="dates"
                      value={newTripData.dates}
                      onChange={(e) => setNewTripData(prev => ({ ...prev, dates: e.target.value }))}
                      placeholder="e.g., Dec 15 - Dec 25, 2024"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="travelers" className="text-sm font-medium">
                      Travelers
                    </Label>
                    <Input
                      id="travelers"
                      type="number"
                      min="1"
                      value={newTripData.travelers}
                      onChange={(e) => setNewTripData(prev => ({ ...prev, travelers: parseInt(e.target.value) || 1 }))}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => {
                onClose();
                resetForm();
              }}
              className="flex-1"
            >
              Cancel
            </Button>
            {showNewTripForm ? (
              <Button
                onClick={handleCreateNewTrip}
                className="flex-1 bg-gradient-to-r from-blue-500 to-orange-500"
              >
                Create Trip
              </Button>
            ) : selectedTripId ? (
              <Button
                onClick={handleAddToExistingTrip}
                className="flex-1 bg-gradient-to-r from-blue-500 to-orange-500"
              >
                Add to Trip
              </Button>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExploreAddToTripModal;
