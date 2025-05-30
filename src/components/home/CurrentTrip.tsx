
import CurrentTripContent from "./CurrentTripContent";

interface Trip {
  id: number;
  name: string;
  destination: string;
  dates: string;
  status: string;
  image: string;
}

interface CurrentTripProps {
  currentTrip: Trip | null;
  travelingTrip: Trip | null;
  nearestUpcomingTrip: Trip | null;
  onViewDetail?: () => void;
  onPlanNewTrip?: () => void;
  onNavigateToTrips?: () => void;
}

const CurrentTrip = ({ 
  currentTrip, 
  travelingTrip, 
  nearestUpcomingTrip, 
  onViewDetail = () => {}, 
  onPlanNewTrip = () => {},
  onNavigateToTrips = () => {}
}: CurrentTripProps) => {
  return (
    <CurrentTripContent
      currentTrip={currentTrip}
      travelingTrip={travelingTrip}
      nearestUpcomingTrip={nearestUpcomingTrip}
      onViewDetail={onViewDetail}
      onPlanNewTrip={onPlanNewTrip}
      onNavigateToTrips={onNavigateToTrips}
    />
  );
};

export default CurrentTrip;
