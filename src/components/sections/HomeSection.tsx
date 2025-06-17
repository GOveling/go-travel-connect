
import { Trip } from "@/types";
import QuickStats from "../home/QuickStats";
import CurrentTrip from "../home/CurrentTrip";
import QuickActions from "../home/QuickActions";
import { useHomeState } from "@/hooks/useHomeState";

const HomeSection = () => {
  const { trips } = useHomeState();
  
  // Find the current trip (traveling status)
  const currentTrip = trips?.find(trip => trip.status === 'traveling') || null;
  
  // Find the nearest upcoming trip
  const upcomingTrips = trips?.filter(trip => trip.status === 'upcoming') || [];
  const nearestUpcomingTrip = upcomingTrips.length > 0 ? upcomingTrips[0] : null;

  const handleCreateTrip = () => {
    console.log("Create trip clicked");
  };

  const handleViewAllTrips = () => {
    console.log("View all trips clicked");
  };

  const handleOpenExploreSection = () => {
    console.log("Open explore section clicked");
  };

  const handleOpenTravelDocuments = () => {
    console.log("Open travel documents clicked");
  };

  const handleOpenAIAssistant = () => {
    console.log("Open AI assistant clicked");
  };

  return (
    <div className="space-y-6 pb-6">
      {/* Quick Stats */}
      <QuickStats trips={trips || []} />

      {/* Current Trip */}
      <CurrentTrip
        currentTrip={currentTrip}
        travelingTrip={currentTrip}
        nearestUpcomingTrip={nearestUpcomingTrip}
        onViewDetail={handleViewAllTrips}
        onPlanNewTrip={handleCreateTrip}
        onNavigateToTrips={handleViewAllTrips}
      />

      {/* Quick Actions */}
      <QuickActions
        onCreateTrip={handleCreateTrip}
        onExplore={handleOpenExploreSection}
        onTravelDocuments={handleOpenTravelDocuments}
        onAIAssistant={handleOpenAIAssistant}
      />
    </div>
  );
};

export default HomeSection;
