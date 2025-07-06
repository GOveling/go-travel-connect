import { useState } from "react";
import { MapPin, Calendar, Plus, Check, Plane, Search, X, Users, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAddToTrip } from "@/hooks/useAddToTrip";
import { useSupabaseTrips } from "@/hooks/useSupabaseTrips";
import NewTripModal from "./NewTripModal";

interface ExploreAddToTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlace: {
    name: string;
    location: string;
    rating?: number;
    image?: string;
    category: string;
    description?: string;
    lat?: number;
    lng?: number;
  } | null;
}

const ExploreAddToTripModal = ({ 
  isOpen, 
  onClose, 
  selectedPlace
}: ExploreAddToTripModalProps) => {
  const { 
    trips, 
    loading, 
    isAddingToTrip, 
    searchQuery, 
    setSearchQuery, 
    categorizeTrips, 
    addPlaceToTrip,
    getEstimatedTime
  } = useAddToTrip();

  const { createTrip } = useSupabaseTrips();
  
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [showNewTripModal, setShowNewTripModal] = useState(false);

  if (!selectedPlace) return null;

  const { matching: matchingTrips, other: otherTrips } = categorizeTrips(selectedPlace);

  const handleAddToExistingTrip = async () => {
    if (selectedTripId && selectedPlace) {
      const success = await addPlaceToTrip(selectedTripId, selectedPlace);
      if (success) {
        onClose();
        resetForm();
      }
    }
  };

  const handleCreateNewTrip = async (tripData: any) => {
    // Add the selected place to the new trip data
    const newTripWithPlace = {
      ...tripData,
      destination: selectedPlace.location,
      coordinates: [
        {
          name: selectedPlace.location,
          lat: selectedPlace.lat || 0,
          lng: selectedPlace.lng || 0
        }
      ],
      // Add the selected place directly to the trip data
      savedPlace: {
        name: selectedPlace.name,
        category: selectedPlace.category,
        rating: selectedPlace.rating || null,
        image: selectedPlace.image || "📍",
        description: selectedPlace.description || "",
        estimated_time: getEstimatedTime(selectedPlace.category),
        priority: 'medium',
        destination_name: selectedPlace.location,
        lat: selectedPlace.lat || null,
        lng: selectedPlace.lng || null
      }
    };

    const createdTrip = await createTrip(newTripWithPlace);
    if (createdTrip) {
      setShowNewTripModal(false);
      onClose();
      resetForm();
    }
  };

  const resetForm = () => {
    setSelectedTripId(null);
    setSearchQuery('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "planning":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-slate-100 text-slate-800 border-slate-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  const TripCard = ({ trip, isMatching = false }: { trip: any; isMatching?: boolean }) => (
    <Card 
      className={`cursor-pointer transition-all duration-300 hover:shadow-md ${
        isMatching 
          ? 'border-emerald-200 hover:border-emerald-300' 
          : 'border-slate-200 hover:border-slate-300'
      } ${
        selectedTripId === trip.id 
          ? isMatching 
            ? 'border-emerald-500 bg-emerald-50 shadow-sm' 
            : 'border-blue-500 bg-blue-50 shadow-sm'
          : ''
      }`}
      onClick={() => setSelectedTripId(trip.id)}
    >
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${
            isMatching 
              ? 'bg-gradient-to-br from-emerald-500 to-teal-500' 
              : 'bg-gradient-to-br from-blue-500 to-purple-500'
          }`}>
            <span className="text-lg">{trip.image || "✈️"}</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-slate-800 truncate">{trip.name}</h4>
              <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize border ${getStatusColor(trip.status)}`}>
                {trip.status}
              </span>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center space-x-2 text-xs text-slate-600">
                <MapPin size={12} />
                <span className="truncate">{trip.destination}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-slate-600">
                  <Calendar size={12} />
                  <span>{trip.dates}</span>
                </div>
                
                <div className="flex items-center space-x-1 text-xs text-slate-500">
                  <Users size={10} />
                  <span>{trip.travelers}</span>
                </div>
              </div>
            </div>
          </div>
          
          {selectedTripId === trip.id && (
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              isMatching ? 'bg-emerald-500' : 'bg-blue-500'
            }`}>
              <Check size={14} className="text-white" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const LoadingSkeleton = () => (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-xl font-bold text-center text-slate-800">
              Add to Trip
            </DialogTitle>
            <div className="text-center">
              <p className="text-sm text-slate-600 flex items-center justify-center gap-2 mb-2">
                <MapPin size={14} />
                <span className="font-medium">{selectedPlace.name}</span>
              </p>
              <p className="text-xs text-slate-500">in {selectedPlace.location}</p>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your trips..."
                className="pl-10 border-slate-200 focus:border-blue-400"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X size={12} />
                </Button>
              )}
            </div>

            {loading ? (
              <LoadingSkeleton />
            ) : trips.length === 0 ? (
              /* No Trips State */
              <div className="text-center py-8 space-y-4">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                  <Plane size={24} className="text-slate-400" />
                </div>
                <div>
                  <h3 className="font-medium text-slate-800 mb-1">No trips yet</h3>
                  <p className="text-sm text-slate-600">Create your first trip to add places</p>
                </div>
              </div>
            ) : (
              <>
                {/* Matching Location Trips */}
                {matchingTrips.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <h3 className="text-sm font-semibold text-emerald-700">
                        Trips to {selectedPlace.location}
                      </h3>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {matchingTrips.map((trip) => (
                        <TripCard key={trip.id} trip={trip} isMatching={true} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Other Trips */}
                {otherTrips.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-slate-400 rounded-full"></div>
                      <h3 className="text-sm font-semibold text-slate-700">Other trips</h3>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {otherTrips.map((trip) => (
                        <TripCard key={trip.id} trip={trip} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Create New Trip Option */}
            <Card className="border-2 border-dashed border-blue-300 hover:border-blue-400 cursor-pointer transition-all duration-200 hover:bg-blue-50/30">
              <CardContent className="p-4">
                <Button
                  onClick={() => setShowNewTripModal(true)}
                  variant="ghost"
                  className="w-full h-auto p-0 justify-start text-left hover:bg-transparent"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Plus size={20} className="text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-800">Create New Trip</h3>
                      <p className="text-sm text-slate-600">Start planning your adventure</p>
                    </div>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="outline"
              onClick={() => {
                onClose();
                resetForm();
              }}
              className="flex-1 border-slate-200"
            >
              Cancel
            </Button>
            
            {selectedTripId && (
              <Button
                onClick={handleAddToExistingTrip}
                disabled={isAddingToTrip}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {isAddingToTrip ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding...
                  </div>
                ) : (
                  <>
                    <Plus size={16} className="mr-2" />
                    Add to Trip
                  </>
                )}
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* New Trip Modal */}
      <NewTripModal
        isOpen={showNewTripModal}
        onClose={() => setShowNewTripModal(false)}
        onCreateTrip={handleCreateNewTrip}
      />
    </>
  );
};

export default ExploreAddToTripModal;
