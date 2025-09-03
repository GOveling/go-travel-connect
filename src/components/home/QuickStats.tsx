
import { MapPin, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useHomeData } from "@/hooks/state/useHomeData";
import { useLanguage } from "@/hooks/useLanguage";
import { calculateTripStatus } from "@/utils/tripStatusUtils";

const QuickStats = () => {
  const { trips } = useHomeData();
  const { t } = useLanguage();

  // Calculate total saved places across all trips
  const totalSavedPlaces = trips.reduce((total, trip) => {
    return total + (trip.savedPlaces?.length || 0);
  }, 0);

  // Active trips count = all except completed (derive from dates)
  const upcomingTrips = trips.filter(
    (trip) => calculateTripStatus(trip) !== "completed"
  ).length;

  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="bg-gradient-to-br from-purple-600 to-purple-700 text-white border-0">
        <CardContent className="p-4 text-center">
          <MapPin className="mx-auto mb-2" size={24} />
          <p className="text-2xl font-bold">{totalSavedPlaces}</p>
          <p className="text-sm opacity-90">{t("home.quickStats.placesSaved")}</p>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
        <CardContent className="p-4 text-center">
          <Calendar className="mx-auto mb-2" size={24} />
          <p className="text-2xl font-bold">{upcomingTrips}</p>
          <p className="text-sm opacity-90">{t("home.quickStats.upcomingTrips")}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickStats;
