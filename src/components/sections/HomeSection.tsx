
import { useEffect } from "react";
import LocationWeatherWidget from "@/components/widgets/LocationWeatherWidget";
import HomeHeader from "@/components/home/HomeHeader";
import QuickStats from "@/components/home/QuickStats";
import CurrentTrip from "@/components/home/CurrentTrip";
import QuickActions from "@/components/home/QuickActions";
import { useHomeState } from "@/hooks/useHomeState";
import { useHomeHandlers } from "@/hooks/useHomeHandlers";

const HomeSection = () => {
  const homeState = useHomeState();
  const handlers = useHomeHandlers(homeState);

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

      <QuickActions />
    </div>
  );
};

export default HomeSection;
