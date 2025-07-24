import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, MapPin, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import type { Trip } from "@/types";

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
          const startDateStr = nearestUpcomingTrip.dates.split(" - ")[0];
          const year =
            nearestUpcomingTrip.dates.split(", ")[1] ||
            new Date().getFullYear().toString();
          const month = startDateStr.split(" ")[0];
          const day = parseInt(startDateStr.split(" ")[1]);

          const monthMap: { [key: string]: number } = {
            Jan: 0,
            Feb: 1,
            Mar: 2,
            Apr: 3,
            May: 4,
            Jun: 5,
            Jul: 6,
            Aug: 7,
            Sep: 8,
            Oct: 9,
            Nov: 10,
            Dec: 11,
          };

          const startDate = new Date(parseInt(year), monthMap[month], day);
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

  // Case 1: Currently traveling - show AI Smart Route
  if (travelingTrip) {
    return (
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-r from-green-600 to-blue-500 p-4 text-white">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <h3 className="font-semibold">AI Smart Route Active</h3>
          </div>
          <p className="text-sm opacity-90">{travelingTrip.destination}</p>
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-center mb-3">
            <p className="text-sm text-gray-600">Following optimized route</p>
            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
              Traveling
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div className="bg-gradient-to-r from-green-600 to-blue-500 h-2 rounded-full w-3/7"></div>
          </div>
          <p className="text-sm text-gray-700 mb-3">
            Next: Optimized destination in route
          </p>
          <Button
            className="w-full bg-gradient-to-r from-green-600 to-blue-500 border-0 hover:from-green-700 hover:to-blue-600"
            onClick={onViewDetail}
          >
            View AI Route Details
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
            <h3 className="font-semibold">Trip Countdown</h3>
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
                <div className="text-xs text-gray-600">Days</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-lg font-bold text-purple-600">
                  {countdown.hours}
                </div>
                <div className="text-xs text-gray-600">Hours</div>
              </div>
              <div className="bg-gray-50 rounded-lg p-2">
                <div className="text-lg font-bold text-purple-600">
                  {countdown.minutes}
                </div>
                <div className="text-xs text-gray-600">Minutes</div>
              </div>
            </div>
            <p className="text-sm text-gray-600">Until your trip begins!</p>
          </div>
          <div className="space-y-2">
            <Button
              className="w-full bg-gradient-to-r from-purple-600 to-orange-500 border-0 hover:from-purple-700 hover:to-orange-600"
              onClick={onNavigateToTrips}
            >
              View Trip Details
            </Button>
            <Button variant="outline" className="w-full" onClick={onViewDetail}>
              Preview AI Smart Route
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
          <h3 className="font-semibold">Plan Your Next Adventure</h3>
        </div>
        <p className="text-sm opacity-90">No upcoming trips planned</p>
      </div>
      <CardContent className="p-4">
        <div className="text-center mb-4">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <MapPin className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-sm text-gray-600 mb-2">
            Ready for your next journey?
          </p>
          <p className="text-xs text-gray-500">
            Create a trip plan and let AI optimize your route
          </p>
        </div>
        <Button
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 border-0 hover:from-blue-700 hover:to-purple-700"
          onClick={onPlanNewTrip}
        >
          <Plus className="w-4 h-4 mr-2" />
          Plan a New Trip
        </Button>
      </CardContent>
    </Card>
  );
};

export default CurrentTripContent;
