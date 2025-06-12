import { useState } from "react";
import { MapPin, Calendar, Plus, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import type { Trip, AddToTripModalProps } from '@/types';

const AddToTripModal = ({ 
  isOpen, 
  onClose, 
  existingTrips, 
  onAddToExistingTrip, 
  onCreateNewTrip,
  postLocation 
}: AddToTripModalProps) => {
  const { toast } = useToast();
  const [selectedTripId, setSelectedTripId] = useState<number | null>(null);

  const handleAddToExistingTrip = () => {
    if (selectedTripId) {
      onAddToExistingTrip(selectedTripId);
      toast({
        title: "Added to Trip!",
        description: `Location has been added to your selected trip.`
      });
      onClose();
      setSelectedTripId(null);
    }
  };

  const handleCreateNewTrip = () => {
    onCreateNewTrip();
    onClose();
    setSelectedTripId(null);
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
          {postLocation && (
            <p className="text-sm text-gray-600 text-center flex items-center justify-center gap-1">
              <MapPin size={14} />
              {postLocation}
            </p>
          )}
        </DialogHeader>
        
        <div className="space-y-4 px-1">
          {/* Create New Trip Option */}
          <Card className="border-2 border-dashed border-blue-300 hover:border-blue-400 cursor-pointer transition-colors">
            <CardContent className="p-4">
              <Button
                onClick={handleCreateNewTrip}
                variant="ghost"
                className="w-full h-auto p-0 justify-start text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Plus size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">Create New Trip</h3>
                    <p className="text-sm text-gray-600">Start planning a new adventure</p>
                  </div>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* Existing Trips */}
          {existingTrips.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-gray-700">Or add to existing trip:</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {existingTrips.map((trip) => (
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
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-orange-500 rounded-lg flex items-center justify-center">
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
                          <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
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

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            {selectedTripId && (
              <Button
                onClick={handleAddToExistingTrip}
                className="flex-1 bg-gradient-to-r from-blue-500 to-orange-500"
              >
                Add to Trip
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddToTripModal;
