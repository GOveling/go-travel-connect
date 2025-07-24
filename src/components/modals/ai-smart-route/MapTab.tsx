import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trip } from "@/types/aiSmartRoute";
import { calculateDestinationDays } from "@/utils/aiSmartRoute";

interface MapTabProps {
  trip: Trip;
  totalSavedPlaces: number;
  totalTripDays: number;
}

const MapTab = ({ trip, totalSavedPlaces, totalTripDays }: MapTabProps) => {
  const destinationDays = calculateDestinationDays(
    trip.dates,
    trip.coordinates.length,
    trip
  );

  return (
    <div className="space-y-6 mt-6">
      <Card className="h-80 sm:h-96 bg-gradient-to-br from-purple-100 to-blue-100 border-2 border-dashed border-purple-300">
        <CardContent className="h-full flex items-center justify-center">
          <div className="text-center px-4">
            <MapPin size={48} className="mx-auto text-purple-600 mb-4" />
            <h3 className="text-lg sm:text-xl font-semibold text-gray-700 mb-2">
              Interactive Route Map
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-2">
              AI-optimized route with your saved places
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              Shows optimized paths with your {totalSavedPlaces} saved places
              across {totalTripDays} days
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">
              Route Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-gray-600">Your Saved Places:</span>
              <span className="font-medium text-sm">{totalSavedPlaces}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-gray-600">Destinations:</span>
              <span className="font-medium text-sm">
                {trip.coordinates.length}
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-gray-600">Total Days:</span>
              <span className="font-medium text-sm">{totalTripDays}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-gray-600">
                Est. Total Distance:
              </span>
              <span className="font-medium text-sm">
                {Math.round(totalSavedPlaces * 2.5)} km
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-sm text-gray-600">Total Travel Time:</span>
              <span className="font-medium text-sm">
                {Math.round(totalSavedPlaces * 0.25)} hours
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base sm:text-lg">
              Day Allocation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {trip.coordinates.map((destination, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex-1 min-w-0 mr-3">
                  <span className="text-sm text-gray-700 truncate block">
                    {destination.name}:
                  </span>
                </div>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <span className="font-medium text-sm whitespace-nowrap">
                    {destinationDays[index]} day
                    {destinationDays[index] > 1 ? "s" : ""}
                  </span>
                  <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MapTab;
