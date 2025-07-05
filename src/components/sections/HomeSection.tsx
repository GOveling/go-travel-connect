
import { useEffect, useState } from "react";
import LocationWeatherWidget from "@/components/widgets/LocationWeatherWidget";
import HomeHeader from "@/components/home/HomeHeader";
import QuickStats from "@/components/home/QuickStats";
import CurrentTrip from "@/components/home/CurrentTrip";
import QuickActions from "@/components/home/QuickActions";
import HomePopularPlace from "@/components/home/HomePopularPlace";
import HomeModals from "@/components/home/HomeModals";
import PlaceDetailModal from "@/components/modals/PlaceDetailModal";
import NearbyPlacesModal from "@/components/modals/NearbyPlacesModal";
import ExploreAddToTripModal from "@/components/modals/ExploreAddToTripModal";
import { useHomeState } from "@/hooks/useHomeState";
import { useHomeHandlers } from "@/hooks/useHomeHandlers";
import { useToast } from "@/hooks/use-toast";

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
      window.dispatchEvent(new CustomEvent('navigateToTrips'));
    };

    // Override the handleNavigateToTrips to trigger the global navigation
    handlers.handleNavigateToTrips = () => {
      window.dispatchEvent(new CustomEvent('navigateToTrips'));
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

  const handleAddToExistingTrip = (tripId: number, place: any) => {
    addPlaceToTrip(tripId, place);
    const selectedTrip = trips.find(trip => trip.id === tripId);
    
    toast({
      title: "Added to Trip",
      description: `${place.name} has been saved to ${selectedTrip?.name}`,
    });
    
    setIsAddToTripModalOpen(false);
    setSelectedPlace(null);
  };

  const handleCreateNewTrip = (tripData: any) => {
    setTrips(prev => [...prev, tripData]);
    setIsAddToTripModalOpen(false);
    setSelectedPlace(null);
    
    toast({
      title: "Trip Created!",
      description: `${tripData.name} has been created with ${selectedPlace?.name}`,
    });
  };

  return (
    <div className="min-h-screen p-4 space-y-4">
      {/* Minimized Location, Date & Weather Widget */}
      <div className="pt-2">
        <LocationWeatherWidget />
      </div>

      {/* Header with Logo and Notification Bell */}
      <HomeHeader
        notificationCount={homeState.notificationCount}
        onNotificationClick={handlers.handleNotificationClick}
      />

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
