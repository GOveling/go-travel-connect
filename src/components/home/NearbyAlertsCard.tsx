import { useState } from "react";
import { MapPin, Radar, AlertTriangle, Map } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/useLanguage";
import { useTravelModeContext } from "@/contexts/TravelModeContext";
import PlaceLocationModal from "@/components/modals/PlaceLocationModal";

interface NearbyAlertsCardProps {
  onToggleTravelMode?: () => void;
}

const NearbyAlertsCard = ({ onToggleTravelMode }: NearbyAlertsCardProps) => {
  const { t } = useLanguage();
  const { isTracking, nearbyPlaces, config } = useTravelModeContext();
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);

  const handlePlaceClick = (place: any) => {
    setSelectedPlace(place);
    setIsMapModalOpen(true);
  };

  const handleShowMap = () => {
    if (nearbyPlaces.length > 0) {
      // Show map with all nearby places
      setSelectedPlace({
        id: "nearby-places-map",
        name: t("home.quickActions.nearbyAlerts"),
        lat: nearbyPlaces[0].lat,
        lng: nearbyPlaces[0].lng,
        places: nearbyPlaces
      });
      setIsMapModalOpen(true);
    }
  };

  // If Travel Mode is not active, show activation prompt
  if (!config.isEnabled || !isTracking) {
    return (
      <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-amber-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <Radar className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm">
                {t("home.quickActions.nearbyAlerts")}
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                {t("home.travelMode.activateToSeeNearby")}
              </p>
            </div>
            <Button
              size="sm"
              onClick={onToggleTravelMode}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {t("home.travelMode.activate")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If Travel Mode is active but no nearby places
  if (nearbyPlaces.length === 0) {
    return (
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Radar className="w-6 h-6 text-blue-600 animate-pulse" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-sm">
                {t("home.quickActions.nearbyAlerts")}
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                {t("home.travelMode.noNearbyPlaces")}
              </p>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {t("home.travelMode.active")}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show nearby places when Travel Mode is active
  return (
    <>
      <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="w-4 h-4 text-green-600 mr-2" />
              {t("home.quickActions.nearbyAlerts")}
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                {nearbyPlaces.length} {nearbyPlaces.length === 1 ? t("common.place") : t("common.places")}
              </Badge>
              {nearbyPlaces.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleShowMap}
                  className="h-6 px-2 border-green-300 text-green-700 hover:bg-green-100"
                >
                  <Map className="w-3 h-3 mr-1" />
                  {t("common.viewMap")}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {nearbyPlaces.slice(0, 3).map((place, index) => (
              <div
                key={place.id || index}
                onClick={() => handlePlaceClick(place)}
                className="flex items-center space-x-3 p-2 rounded-lg bg-white border border-green-100 hover:border-green-200 cursor-pointer transition-colors"
              >
                {/* Proximity Number Badge */}
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold">{index + 1}</span>
                </div>
                
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {place.name}
                  </p>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {place.category || t("common.place")}
                    </span>
                    <span className="text-xs font-medium text-green-600">
                      {typeof place.distance === 'string' 
                        ? place.distance 
                        : place.distance >= 1000 
                          ? `${(place.distance / 1000).toFixed(1)} ${t("home.travelMode.kmUnit")}`
                          : `${Math.round(place.distance)} ${t("home.travelMode.distanceUnit")}`
                      }
                    </span>
                  </div>
                </div>
              </div>
            ))}
            
            {nearbyPlaces.length > 3 && (
              <div className="pt-2 border-t border-green-100">
                <p className="text-xs text-center text-gray-500">
                  +{nearbyPlaces.length - 3} {t("common.morePlaces")}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Place Location Modal */}
      <PlaceLocationModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        place={selectedPlace}
      />
    </>
  );
};

export default NearbyAlertsCard;