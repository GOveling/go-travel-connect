import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/hooks/useLanguage";
import { useTravelMode } from "@/hooks/useTravelMode";
import type { Trip } from "@/types";
import { Calendar, MapPin, Navigation, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { TravelModeModal } from "@/components/modals/TravelModeModal";

interface CurrentTripContentProps {
  currentTrip: Trip | null;
  travelingTrip: Trip | null;
  nearestUpcomingTrip: Trip | null;
  onViewDetail: () => void;
  onPlanNewTrip: () => void;
  onNavigateToTrips: () => void;
}

const CurrentTripContent = ({
  currentTrip,
  travelingTrip,
  nearestUpcomingTrip,
  onViewDetail,
  onPlanNewTrip,
  onNavigateToTrips,
}: CurrentTripContentProps) => {
  const navigate = useNavigate();
  const { config } = useTravelMode();
  const { t } = useLanguage(); // Main translation function
  const [countdown, setCountdown] = useState<{
    days: number;
    hours: number;
    minutes: number;
  } | null>(null);

  // Calculate countdown for upcoming trip
  useEffect(() => {
    if (nearestUpcomingTrip && !travelingTrip) {
      const calculateCountdown = () => {
        try {
          const startDate = nearestUpcomingTrip.startDate;
          if (!startDate) {
            setCountdown(null);
            return;
          }

          const currentDate = new Date();
          const timeDifference = startDate.getTime() - currentDate.getTime();

          if (timeDifference > 0) {
            const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
            const hours = Math.floor(
              (timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
            );
            const minutes = Math.floor(
              (timeDifference % (1000 * 60 * 60)) / (1000 * 60)
            );

            setCountdown({ days, hours, minutes });
          }
        } catch (error) {
          setCountdown(null);
        }
      };

      calculateCountdown();
      const interval = setInterval(calculateCountdown, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [nearestUpcomingTrip, travelingTrip]);

  // Case 1: Currently traveling - show Travel Mode access
  if (travelingTrip) {
    return (
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-r from-green-600 to-blue-500 p-4 text-white">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4" />
            <h3 className="font-semibold">
              {t("home.travelMode.currentTrip")}
            </h3>
            <MapPin className="w-4 h-4" />
            <h3 className="font-semibold">
              {t("home.currentTrip.aiSmartRouteActive")}
            </h3>
          </div>
          <p className="text-sm opacity-90">{travelingTrip.destination}</p>
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm text-gray-600">
              {config.isEnabled
                ? t("home.travelMode.travelModeActive")
                : t("home.travelMode.travelModeInactive")}
            </p>
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                config.isEnabled
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {config.isEnabled ? t("common.active") : t("common.inactive")}
            </span>
            <p className="text-sm text-gray-600">
              {t("home.currentTrip.followingOptimizedRoute")}
            </p>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              {t("home.currentTrip.traveling")}
            </span>
          </div>
          <div className="space-y-2">
            <TravelModeModal>
              <Button className="w-full bg-gradient-to-r from-green-600 to-blue-500 border-0 hover:from-green-700 hover:to-blue-600">
                <Navigation className="w-4 h-4 mr-2" />
                {t("home.travelMode.accessTravelMode")}
              </Button>
            </TravelModeModal>
            <Button variant="outline" className="w-full" onClick={onViewDetail}>
              {t("home.currentTrip.viewDetails")}
            </Button>
          </div>
          <p className="text-sm text-gray-700 mb-3">
            {t("home.currentTrip.nextOptimizedDestination")}
          </p>
          <Button
            className="w-full bg-gradient-to-r from-green-600 to-blue-500 border-0 hover:from-green-700 hover:to-blue-600"
            onClick={onViewDetail}
          >
            {t("home.currentTrip.viewAIRouteDetails")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Case 2: Upcoming trip within 40 days - show countdown
  if (nearestUpcomingTrip && countdown) {
    return (
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-r from-purple-600 to-orange-500 p-4 text-white">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <h3 className="font-semibold">
              {t("home.currentTrip.tripCountdown")}
            </h3>
          </div>
          <p className="text-sm opacity-90">
            {nearestUpcomingTrip.destination}
          </p>
        </div>
        <CardContent className="p-4">
          <div className="text-center mb-4">
            <div className="grid grid-cols-3 gap-2 mb-2">
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-lg font-bold text-purple-600">
                  {countdown.days}
                </div>
                <div className="text-xs text-gray-600">
                  {t("home.currentTrip.days")}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-lg font-bold text-purple-600">
                  {countdown.hours}
                </div>
                <div className="text-xs text-gray-600">
                  {t("home.currentTrip.hours")}
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-lg font-bold text-purple-600">
                  {countdown.minutes}
                </div>
                <div className="text-xs text-gray-600">
                  {t("home.currentTrip.minutes")}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {t("home.currentTrip.untilTripBegins")}
            </p>
          </div>
          <div className="space-y-2">
            <Button
              className="w-full bg-gradient-to-r from-purple-600 to-orange-500 border-0 hover:from-purple-700 hover:to-orange-600"
              onClick={onNavigateToTrips}
            >
              {t("home.currentTrip.viewTripDetails")}
            </Button>
            <Button variant="outline" className="w-full" onClick={onViewDetail}>
              {t("home.currentTrip.previewAISmartRoute")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Case 3: No upcoming trips - show plan new trip button
  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <div className="bg-gradient-to-r from-gray-600 to-gray-700 p-4 text-white">
        <div className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          <h3 className="font-semibold">
            {t("home.currentTrip.planYourNextAdventure")}
          </h3>
        </div>
        <p className="text-sm opacity-90">
          {t("home.currentTrip.noUpcomingTrips")}
        </p>
      </div>
      <CardContent className="p-4">
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <MapPin className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600 mb-2">
            {t("home.currentTrip.readyForNextJourney")}
          </p>
          <p className="text-xs text-gray-500">
            {t("home.currentTrip.createTripPlan")}
          </p>
        </div>
        <Button
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 border-0 hover:from-blue-700 hover:to-purple-700"
          onClick={onPlanNewTrip}
        >
          <Plus className="w-4 h-4 mr-2" />
          {t("home.currentTrip.planNewTrip")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default CurrentTripContent;
