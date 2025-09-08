import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/hooks/useLanguage";
import { Bookmark, Map, MapPin, Users } from "lucide-react";

interface TripSelectorProps {
  trips: any[];
  selectedTripId: string | null;
  onSelectTrip: (tripId: string | null) => void;
  showSavedPlaces?: boolean;
  onToggleSavedPlaces?: () => void;
}

const TripSelector = ({
  trips,
  selectedTripId,
  onSelectTrip,
  showSavedPlaces = true,
  onToggleSavedPlaces,
}: TripSelectorProps) => {
  const { t } = useLanguage();
  const selectedTrip = trips.find((trip) => trip.id === selectedTripId);

  const renderPlaceImage = (imageUrl: string) => {
    if (!imageUrl) return null;

    // Check if it's a URL (Google Places API image)
    if (
      imageUrl.startsWith("http") ||
      imageUrl.includes("googleusercontent") ||
      imageUrl.includes("maps.googleapis.com")
    ) {
      return (
        <img
          src={imageUrl}
          alt="Place"
          className="w-4 h-4 rounded object-cover flex-shrink-0"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
      );
    }

    // Otherwise, treat as emoji
    return <span className="flex-shrink-0">{imageUrl}</span>;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming":
        return "bg-green-500 text-white";
      case "planning":
        return "bg-purple-600 text-white";
      case "completed":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-300 text-gray-700";
    }
  };

  return (
    <Card className="w-full min-w-0">
      <CardContent className="p-4 space-y-4 min-w-0">
        <div className="flex items-center justify-between min-w-0">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <Map size={20} className="text-purple-600 flex-shrink-0" />
            <h3 className="font-semibold truncate">
              {t("trips.map.tripSelector")}
            </h3>
          </div>
          {selectedTripId && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSelectTrip(null)}
              className="h-8"
            >
              {t("trips.map.viewAll")}
            </Button>
          )}
        </div>

        {/* Trip Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {t("trips.map.selectTrip")}
          </label>
          <Select
            value={selectedTripId || "all"}
            onValueChange={(value) =>
              onSelectTrip(value === "all" ? null : value)
            }
          >
            <SelectTrigger className="w-full min-w-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="w-full min-w-[280px] max-w-[90vw]">
              <SelectItem value="all">🗺️ {t("trips.map.allTrips")}</SelectItem>
              {trips.map((trip) => (
                <SelectItem key={trip.id} value={trip.id}>
                  <div className="flex items-center space-x-2 min-w-0">
                    {renderPlaceImage(trip.image)}
                    <span className="truncate flex-1">{trip.name}</span>
                    <Badge
                      className={`text-xs flex-shrink-0 ${getStatusColor(trip.status)}`}
                    >
                      {trip.status}
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Trip Details */}
        {selectedTrip && (
          <div className="bg-gradient-to-r from-purple-50 to-orange-50 rounded-lg p-4 space-y-3 min-w-0">
            <div className="flex items-start space-x-3 min-w-0">
              <div className="flex-shrink-0">
                {selectedTrip.image && selectedTrip.image.startsWith("http") ? (
                  <img
                    src={selectedTrip.image}
                    alt="Trip"
                    className="w-8 h-8 rounded object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <div className="text-2xl">{selectedTrip.image}</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-lg truncate">
                  {selectedTrip.name}
                </h4>
                <p className="text-sm text-gray-600 mb-2 truncate">
                  {selectedTrip.dates}
                </p>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <MapPin size={14} className="text-gray-500" />
                    <span className="whitespace-nowrap">
                      {selectedTrip.coordinates?.length || 0}{" "}
                      {t("trips.map.destinations")}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 flex-shrink-0">
                    <Bookmark size={14} className="text-gray-500" />
                    <span className="whitespace-nowrap">
                      {selectedTrip.savedPlaces?.length || 0}{" "}
                      {t("trips.map.savedPlacesCount")}
                    </span>
                  </div>
                  {selectedTrip.isGroupTrip && (
                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <Users size={14} className="text-purple-600" />
                      <span className="text-purple-600 whitespace-nowrap">
                        {t("trips.map.group")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Trip Destinations */}
            {selectedTrip.coordinates &&
              selectedTrip.coordinates.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-700">
                    {t("trips.map.destinations")}:
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {selectedTrip.coordinates.map(
                      (coord: any, index: number) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {coord.name}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              )}

            {/* Saved Places Summary */}
            {selectedTrip.savedPlaces &&
              selectedTrip.savedPlaces.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-medium text-gray-700">
                      {t("trips.map.savedPlacesCount")}:
                    </h5>
                    {onToggleSavedPlaces && (
                      <Button
                        size="sm"
                        variant={showSavedPlaces ? "default" : "outline"}
                        onClick={onToggleSavedPlaces}
                        className="h-6 text-xs"
                      >
                        {showSavedPlaces
                          ? t("trips.map.hide")
                          : t("trips.map.show")}
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {selectedTrip.savedPlaces
                      .slice(0, 4)
                      .map((place: any, index: number) => (
                        <div
                          key={index}
                          className="flex items-center space-x-1 bg-white rounded p-2"
                        >
                          {renderPlaceImage(place.image)}
                          <span className="truncate">{place.name}</span>
                        </div>
                      ))}
                    {selectedTrip.savedPlaces.length > 4 && (
                      <div className="col-span-2 text-center text-gray-500">
                        +{selectedTrip.savedPlaces.length - 4} lugares más
                      </div>
                    )}
                  </div>
                </div>
              )}
          </div>
        )}

        {/* Quick Stats for Selected Trip */}
        {selectedTrip && (
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center bg-gray-50 rounded p-2">
              <div className="text-lg font-bold text-purple-600">
                {selectedTrip.coordinates?.length || 0}
              </div>
              <div className="text-xs text-gray-600">
                {t("trips.map.destinations")}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded p-2">
              <div className="text-lg font-bold text-green-600">
                {selectedTrip.savedPlaces?.length || 0}
              </div>
              <div className="text-xs text-gray-600">
                {t("trips.map.placesCount")}
              </div>
            </div>
            <div className="text-center bg-gray-50 rounded p-2">
              <div className="text-lg font-bold text-orange-600">
                {selectedTrip.travelers || 1}
              </div>
              <div className="text-xs text-gray-600">
                {t("trips.map.travelers")}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TripSelector;
