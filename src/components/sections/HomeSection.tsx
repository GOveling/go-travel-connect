import CurrentTrip from "@/components/home/CurrentTrip";
import HomeModals from "@/components/home/HomeModals";
import HomePopularPlace from "@/components/home/HomePopularPlace";
import NotificationBell from "@/components/home/NotificationBell";
import QuickActions from "@/components/home/QuickActions";
import QuickStats from "@/components/home/QuickStats";
import ExploreAddToTripModal from "@/components/modals/ExploreAddToTripModal";
import NearbyPlacesModal from "@/components/modals/NearbyPlacesModal";
import PlaceDetailModal from "@/components/modals/PlaceDetailModal";
import LocationWeatherWidget from "@/components/widgets/LocationWeatherWidget";
import { useToast } from "@/hooks/use-toast";
import { useHomeHandlers } from "@/hooks/useHomeHandlers";
import { useHomeState } from "@/hooks/useHomeState";
import { useEffect, useState } from "react";

const HomeSection = () => {
  const homeState = useHomeState();
  const handlers = useHomeHandlers(homeState);
  const { toast } = useToast();

  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);
  const [isNearbyPlacesModalOpen, setIsNearbyPlacesModalOpen] = useState(false);
  const [isAddToTripModalOpen, setIsAddToTripModalOpen] = useState(false);

  // Get trips and trip management functions from homeState
  const { trips, addPlaceToTrip, setTrips } = homeState;

  // Listen for navigation to trips section
  useEffect(() => {
    const handleNavigateToTrips = () => {
      window.dispatchEvent(new CustomEvent("navigateToTrips"));
    };

    // Override the handleNavigateToTrips to trigger the global navigation
    handlers.handleNavigateToTrips = () => {
      window.dispatchEvent(new CustomEvent("navigateToTrips"));
    };
  }, []);

  const handlePlaceClick = (place: any) => {
    setSelectedPlace(place);
    setIsPlaceModalOpen(true);
  };

  const handleClosePlaceModal = () => {
    setIsPlaceModalOpen(false);
    setSelectedPlace(null);
  };

  const handleNearbyAlertsClick = () => {
    setIsNearbyPlacesModalOpen(true);
  };

  const handleCloseNearbyPlacesModal = () => {
    setIsNearbyPlacesModalOpen(false);
  };

  const handleAddToTrip = () => {
    setIsPlaceModalOpen(false);
    setIsAddToTripModalOpen(true);
  };

  const handleAddToExistingTrip = (tripId: string, place: any) => {
    addPlaceToTrip(tripId, place);
    const selectedTrip = trips.find((trip) => trip.id === tripId);

    toast({
      title: "Added to Trip",
      description: `${place.name} has been saved to ${selectedTrip?.name}`,
    });

    setIsAddToTripModalOpen(false);
    setSelectedPlace(null);
  };

  const handleCreateNewTrip = (tripData: any) => {
    setTrips((prev) => [...prev, tripData]);
    setIsAddToTripModalOpen(false);
    setSelectedPlace(null);

    toast({
      title: "Trip Created!",
      description: `${tripData.name} has been created with ${selectedPlace?.name}`,
    });
  };

  return (
    <div className="min-h-screen p-4 space-y-4">
      {/* Location, Date & Weather Widget with Notification Bell */}
      <div className="pt-2 flex items-center gap-3">
        <div className="flex-1">
          <LocationWeatherWidget />
        </div>
        <NotificationBell />
      </div>

      {/* Quick Stats */}
      <QuickStats />

      <CurrentTrip
        currentTrip={homeState.currentTrip}
        travelingTrip={homeState.travelingTrip}
        nearestUpcomingTrip={homeState.nearestUpcomingTrip}
        onViewDetail={handlers.handleViewCurrentTripDetail}
        onPlanNewTrip={handlers.handlePlanNewTrip}
        onNavigateToTrips={handlers.handleNavigateToTrips}
      />

      <QuickActions onNearbyAlertsClick={handleNearbyAlertsClick} />

      {/* Development: Quick access to Travel Mode for web testing */}
      {typeof window !== "undefined" && !window.Capacitor && (
        <div className="px-4 py-2">
          <button
            onClick={() => (window.location.href = "/travel-mode")}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 transition-colors"
          >
            🧭 Travel Mode (Dev)
          </button>
        </div>
      )}

      {/* Popular Place Globally */}
      <HomePopularPlace onPlaceClick={handlePlaceClick} />

      {/* Render all modals */}
      <HomeModals homeState={homeState} handlers={handlers} />

      {/* Place Detail Modal */}
      <PlaceDetailModal
        place={selectedPlace}
        isOpen={isPlaceModalOpen}
        onClose={handleClosePlaceModal}
        onAddToTrip={handleAddToTrip}
      />

      {/* Nearby Places Modal */}
      <NearbyPlacesModal
        isOpen={isNearbyPlacesModalOpen}
        onClose={handleCloseNearbyPlacesModal}
        onPlaceClick={handlePlaceClick}
      />

      {/* Add to Trip Modal */}
      <ExploreAddToTripModal
        isOpen={isAddToTripModalOpen}
        onClose={() => setIsAddToTripModalOpen(false)}
        selectedPlace={selectedPlace}
      />
    </div>
  );
};

export default HomeSection;
