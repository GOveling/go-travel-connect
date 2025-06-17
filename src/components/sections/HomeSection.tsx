
import { Trip } from "@/types";
import QuickStats from "../home/QuickStats";
import CurrentTrip from "../home/CurrentTrip";
import QuickActions from "../home/QuickActions";

interface HomeSectionProps {
  trips: Trip[];
  onCreateTrip: () => void;
  onViewAllTrips: () => void;
  onOpenExploreSection: () => void;
  onOpenTravelDocuments: () => void;
  onOpenAIAssistant: () => void;
}

const HomeSection = ({
  trips,
  onCreateTrip,
  onViewAllTrips,
  onOpenExploreSection,
  onOpenTravelDocuments,
  onOpenAIAssistant
}: HomeSectionProps) => {
  // Find the current trip (traveling status)
  const currentTrip = trips.find(trip => trip.status === 'traveling') || null;
  
  // Find the nearest upcoming trip
  const upcomingTrips = trips.filter(trip => trip.status === 'upcoming');
  const nearestUpcomingTrip = upcomingTrips.length > 0 ? upcomingTrips[0] : null;

  return (
    <div className="space-y-6 pb-6">
      {/* Quick Stats */}
      <QuickStats trips={trips} />

      {/* Current Trip */}
      <CurrentTrip
        currentTrip={currentTrip}
        travelingTrip={currentTrip}
        nearestUpcomingTrip={nearestUpcomingTrip}
        onViewDetail={onViewAllTrips}
        onPlanNewTrip={onCreateTrip}
        onNavigateToTrips={onViewAllTrips}
      />

      {/* Quick Actions */}
      <QuickActions
        onCreateTrip={onCreateTrip}
        onExplore={onOpenExploreSection}
        onTravelDocuments={onOpenTravelDocuments}
        onAIAssistant={onOpenAIAssistant}
      />
    </div>
  );
};

export default HomeSection;
