
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
import { useHomeState } from "@/hooks/useHomeState";
import { useHomeHandlers } from "@/hooks/useHomeHandlers";

const HomeSection = () => {
  const homeState = useHomeState();
  const handlers = useHomeHandlers(homeState);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [isPlaceModalOpen, setIsPlaceModalOpen] = useState(false);
  const [isNearbyPlacesModalOpen, setIsNearbyPlacesModalOpen] = useState(false);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-orange-50">
      <div className="p-4 space-y-6">
        {/* Minimized Location, Date & Weather Widget */}
        <div className="pt-2">
          <LocationWeatherWidget />
        </div>

        {/* Header with Logo and Notification Bell */}
        <div className="bg-gradient-to-r from-purple-600 to-orange-500 rounded-2xl p-6 text-white shadow-lg">
          <HomeHeader
            notificationCount={homeState.notificationCount}
            onNotificationClick={handlers.handleNotificationClick}
          />
        </div>

        {/* Quick Stats */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100">
          <QuickStats />
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100">
          <CurrentTrip 
            currentTrip={homeState.currentTrip}
            travelingTrip={homeState.travelingTrip}
            nearestUpcomingTrip={homeState.nearestUpcomingTrip}
            onViewDetail={handlers.handleViewCurrentTripDetail}
            onPlanNewTrip={handlers.handlePlanNewTrip}
            onNavigateToTrips={handlers.handleNavigateToTrips}
          />
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100">
          <QuickActions onNearbyAlertsClick={handleNearbyAlertsClick} />
        </div>

        {/* Popular Place Globally */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-purple-100">
          <HomePopularPlace onPlaceClick={handlePlaceClick} />
        </div>

        {/* Render all modals */}
        <HomeModals homeState={homeState} handlers={handlers} />

        {/* Place Detail Modal */}
        <PlaceDetailModal 
          place={selectedPlace}
          isOpen={isPlaceModalOpen}
          onClose={handleClosePlaceModal}
          onAddToTrip={() => {
            // Handle add to trip functionality here if needed
            setIsPlaceModalOpen(false);
          }}
        />

        {/* Nearby Places Modal */}
        <NearbyPlacesModal
          isOpen={isNearbyPlacesModalOpen}
          onClose={handleCloseNearbyPlacesModal}
          onPlaceClick={handlePlaceClick}
        />
      </div>
    </div>
  );
};

export default HomeSection;
