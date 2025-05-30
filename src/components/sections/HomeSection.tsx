
import { useEffect } from "react";
import LocationWeatherWidget from "@/components/widgets/LocationWeatherWidget";
import HomeHeader from "@/components/home/HomeHeader";
import QuickStats from "@/components/home/QuickStats";
import CurrentTrip from "@/components/home/CurrentTrip";
import QuickActions from "@/components/home/QuickActions";
import ProfilePublication from "@/components/home/ProfilePublication";
import FollowedFriendsPublications from "@/components/home/FollowedFriendsPublications";
import HomeModals from "@/components/home/HomeModals";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
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

      {/* Demo Login Button */}
      <div className="flex justify-end">
        <Button
          onClick={() => homeState.setIsLoginModalOpen && homeState.setIsLoginModalOpen(true)}
          className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white"
        >
          <LogIn size={16} className="mr-2" />
          Login
        </Button>
      </div>

      {/* Header with Logo, InstanTrip button, and Notification Bell */}
      <HomeHeader
        notificationCount={homeState.notificationCount}
        instaTripImageCount={homeState.instaTripImages.length}
        onNotificationClick={handlers.handleNotificationClick}
        onInstaTripClick={handlers.handleInstaTripClick}
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

      <QuickActions onAddMemoryClick={handlers.handleAddMemoryClick} />

      <FollowedFriendsPublications
        publications={homeState.friendPublications}
        onLike={handlers.handleLikePublication}
        onComment={handlers.handleCommentPublication}
        onShare={handlers.handleSharePublication}
        formatTimeAgo={handlers.formatTimeAgo}
        trips={homeState.trips}
        onAddToExistingTrip={homeState.addPlaceToTrip}
        onCreateNewTrip={handlers.handleCreateTrip}
      />

      <ProfilePublication
        posts={homeState.profilePosts}
        onProfilePublicationClick={handlers.handleProfilePublicationClick}
        onAddToTrip={handlers.handleAddToTrip}
        formatTimeAgo={handlers.formatTimeAgo}
      />

      {/* All Modals */}
      <HomeModals homeState={homeState} handlers={handlers} />
    </div>
  );
};

export default HomeSection;
