import { MapPin, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useHomeData } from "@/hooks/state/useHomeData";

const QuickStats = () => {
  const { trips } = useHomeData();

  // Calculate total saved places across all trips
  const totalSavedPlaces = trips.reduce((total, trip) => {
    return total + (trip.savedPlaces?.length || 0);
  }, 0);

  // Calculate upcoming trips (trips with status 'upcoming' or 'planning')
  const upcomingTrips = trips.filter(
    (trip) => trip.status === "upcoming" || trip.status === "planning"
  ).length;

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white border-0">
        <CardContent className="p-4 text-center">
          <MapPin className="mx-auto mb-2" size={24} />
          <p className="text-2xl font-bold">{totalSavedPlaces}</p>
          <p className="text-sm opacity-90">Places Saved</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
        <CardContent className="p-4 text-center">
          <Calendar className="mx-auto mb-2" size={24} />
          <p className="text-2xl font-bold">{upcomingTrips}</p>
          <p className="text-sm opacity-90">Upcoming Trips</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickStats;
