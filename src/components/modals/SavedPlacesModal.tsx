import { useState, useMemo } from "react";
import {
  MapPin,
  X,
  Star,
  Heart,
  Trash2,
  Plus,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PlaceDetailModal from "./PlaceDetailModal";
import { Trip, SavedPlace } from "@/types";

// Interface for PlaceDetailModal
interface PlaceForModal {
  name: string;
  location: string;
  rating: number;
  image: string;
  category: string;
  description?: string;
  hours?: string;
  website?: string;
  phone?: string;
  lat?: number;
  lng?: number;
}

interface SavedPlacesModalProps {
  trip: Trip | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateTrip?: (tripData: any) => void;
}

const SavedPlacesModal = ({
  trip,
  isOpen,
  onClose,
  onUpdateTrip,
}: SavedPlacesModalProps) => {
  const { toast } = useToast();
  const [showPlaceDetailModal, setShowPlaceDetailModal] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceForModal | null>(null);
  const [isRemoving, setIsRemoving] = useState<string | null>(null);
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  const [placeToRemove, setPlaceToRemove] = useState<SavedPlace | null>(null);

  // Function to navigate to explore section
  const handleNavigateToExplore = () => {
    onClose(); // Close the modal first
    const event = new CustomEvent("navigateToExplore", {
      detail: { sourceTrip: trip },
    });
    window.dispatchEvent(event);
  };

  // Function to handle viewing place details
  const handleViewPlaceDetails = (place: SavedPlace) => {
    // Convert SavedPlace to the format expected by PlaceDetailModal
    const placeForModal: PlaceForModal = {
      name: place.name,
      location: place.destinationName || "Location details",
      rating: place.rating || 0,
      image: place.image || "📍",
      category: place.category || "Place",
      description: place.description || "",
      hours: place.estimatedTime || "N/A",
      website: undefined,
      phone: undefined,
      lat: place.lat || undefined,
      lng: place.lng || undefined,
    };
    setSelectedPlace(placeForModal);
    setShowPlaceDetailModal(true);
  };

  // Group saved places by country from destination_name and sort by position_order
  const savedPlacesByCountry = useMemo(() => {
    if (!trip?.savedPlaces) return {};

    // First sort all places by position_order
    const sortedPlaces = [...trip.savedPlaces].sort((a, b) => {
      const posA = a.position_order || 0;
      const posB = b.position_order || 0;
      return posA - posB;
    });

    return sortedPlaces.reduce(
      (acc, place) => {
        // Extract country from destination_name (assuming format like "City, Country")
        const destinationName = place.destinationName || "Other";
        const country = destinationName.includes(",")
          ? destinationName.split(",").pop()?.trim() || "Other"
          : destinationName;

        if (!acc[country]) {
          acc[country] = [];
        }
        acc[country].push(place);
        return acc;
      },
      {} as Record<string, SavedPlace[]>
    );
  }, [trip?.savedPlaces]);

  // Get total saved places count
  const totalSavedPlaces = useMemo(() => {
    return trip?.savedPlaces?.length || 0;
  }, [trip?.savedPlaces]);

  // Function to show remove confirmation
  const handleRemovePlace = (place: SavedPlace) => {
    setPlaceToRemove(place);
    setShowRemoveConfirmation(true);
  };

  // Function to confirm and delete the saved place
  const confirmRemovePlace = async () => {
    if (!trip || !placeToRemove) return;

    try {
      setIsRemoving(placeToRemove.id);

      // Delete from Supabase
      const { error } = await supabase
        .from("saved_places")
        .delete()
        .eq("id", placeToRemove.id);

      if (error) {
        console.error("Error deleting place:", error);
        toast({
          title: "Error",
          description: "Failed to remove place. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // Update the trip state locally by filtering out the deleted place
      if (onUpdateTrip && trip.savedPlaces) {
        const updatedSavedPlaces = trip.savedPlaces.filter(
          (place) => place.id !== placeToRemove.id
        );
        const updatedTrip = {
          ...trip,
          savedPlaces: updatedSavedPlaces,
        };
        onUpdateTrip(updatedTrip);
      }

      toast({
        title: "Place removed",
        description: "The place has been successfully removed from your trip.",
      });

      // Close the confirmation modal
      setShowRemoveConfirmation(false);
      setPlaceToRemove(null);
    } catch (error) {
      console.error("Error removing place:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRemoving(null);
    }
  };

  // Function to render place image - handles both URLs and emoji/icons
  const renderPlaceImage = (imageUrl: string | null) => {
    if (!imageUrl) {
      return <span className="text-2xl">📍</span>;
    }

    // Check if it's a URL (contains http/https)
    if (imageUrl.includes("http://") || imageUrl.includes("https://")) {
      return (
        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
          <img
            src={imageUrl}
            alt="Place"
            className="w-full h-full object-cover"
            onError={(e) => {
              // Fallback to default icon if image fails to load
              e.currentTarget.style.display = "none";
              e.currentTarget.nextElementSibling?.classList.remove("hidden");
            }}
          />
          <div className="hidden w-full h-full flex items-center justify-center text-2xl">
            📍
          </div>
        </div>
      );
    }

    // It's an emoji or icon, render as text
    return <span className="text-2xl">{imageUrl}</span>;
  };

  // Function to cancel remove operation
  const cancelRemovePlace = () => {
    setShowRemoveConfirmation(false);
    setPlaceToRemove(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (!trip) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto rounded-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-center space-x-2 text-lg sm:text-xl px-2">
              <Heart className="text-red-500" size={20} />
              <span className="truncate">Saved Places - {trip.name}</span>
              <Badge variant="secondary" className="ml-2 text-xs">
                {totalSavedPlaces}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 px-2 sm:px-0">
            {/* Header with Add Places Button */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                  Your Saved Places
                </h3>
                <p className="text-xs sm:text-sm text-gray-600">
                  Places numbered for map reference
                </p>
              </div>
              <Button
                onClick={handleNavigateToExplore}
                className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 w-full sm:w-auto"
                size="sm"
              >
                <Plus size={14} className="mr-2" />
                Add Places
              </Button>
            </div>

            {/* Saved Places Content */}
            {totalSavedPlaces === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📍</div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  No saved places yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start exploring and save places you want to visit on your trip!
                </p>
                <Button
                  onClick={handleNavigateToExplore}
                  className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600"
                >
                  <Plus size={16} className="mr-2" />
                  Explore Places
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(savedPlacesByCountry).map(([country, places]) => (
                  <div key={country}>
                    <div className="flex items-center space-x-2 mb-4">
                      <MapPin size={20} className="text-blue-600" />
                      <h4 className="text-lg font-semibold text-gray-800">
                        {country}
                      </h4>
                      <Badge variant="outline" className="bg-blue-50 border-blue-200">
                        {places.length} place{places.length > 1 ? "s" : ""}
                      </Badge>
                    </div>

                    <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                      {places.map((place) => (
                        <Card
                          key={place.id}
                          className="cursor-pointer hover:shadow-lg transition-shadow relative"
                          onClick={() => handleViewPlaceDetails(place)}
                        >
                          <CardContent className="p-3 sm:p-4">
                            {/* Position number badge */}
                            <div className="absolute -top-2 -left-2 w-6 h-6 bg-gradient-to-r from-purple-600 to-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-md z-10">
                              {place.position_order || 0}
                            </div>
                            
                            <div className="flex items-start space-x-3">
                              <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
                                {renderPlaceImage(place.image)}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h5 className="text-sm sm:text-base font-semibold text-gray-800 truncate">
                                      {place.name}
                                    </h5>
                                    <p className="text-xs sm:text-sm text-gray-600 mb-2">
                                      {place.category}
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-6 w-6 sm:h-8 sm:w-8 p-0 ml-2"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemovePlace(place);
                                    }}
                                    disabled={isRemoving === place.id}
                                  >
                                    {isRemoving === place.id ? (
                                      <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-2 border-red-500 border-t-transparent" />
                                    ) : (
                                      <Trash2 size={12} className="sm:w-4 sm:h-4" />
                                    )}
                                  </Button>
                                </div>

                                <div className="flex items-center space-x-2 mb-2">
                                  <div className="flex items-center">
                                    <Star
                                      size={14}
                                      className="text-yellow-400 fill-current"
                                    />
                                    <span className="text-sm text-gray-600 ml-1">
                                      {place.rating || "N/A"}
                                    </span>
                                  </div>
                                  <Badge
                                    className={`text-xs px-2 py-1 ${getPriorityColor(
                                      place.priority
                                    )}`}
                                  >
                                    {place.priority}
                                  </Badge>
                                </div>

                                <p className="text-xs text-gray-500 truncate">
                                  {place.description || "No description"}
                                </p>
                                <p className="text-xs text-blue-600 mt-1">
                                  Est. time: {place.estimatedTime}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Place Detail Modal */}
      <PlaceDetailModal
        place={selectedPlace}
        isOpen={showPlaceDetailModal}
        onClose={() => {
          setShowPlaceDetailModal(false);
          setSelectedPlace(null);
        }}
      />

      {/* Remove Confirmation Dialog */}
      <AlertDialog
        open={showRemoveConfirmation}
        onOpenChange={setShowRemoveConfirmation}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove place from trip?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove "{placeToRemove?.name}" from your
              trip? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelRemovePlace}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmRemovePlace}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SavedPlacesModal;