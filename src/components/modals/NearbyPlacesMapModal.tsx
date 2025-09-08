import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation } from "lucide-react";
import { useLanguage } from "@/hooks/useLanguage";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useState } from "react";

interface NearbyPlace {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distance: number | string;
  category?: string;
}

interface NearbyPlacesMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  places: NearbyPlace[];
}

const NearbyPlacesMapModal = ({ isOpen, onClose, places }: NearbyPlacesMapModalProps) => {
  const { t } = useLanguage();
  const { location: userLocation, getCurrentLocation } = useUserLocation();
  const [showUserLocation, setShowUserLocation] = useState(false);

  const handleToggleUserLocation = async () => {
    if (!showUserLocation) {
      await getCurrentLocation();
    }
    setShowUserLocation(!showUserLocation);
  };

  if (!places || places.length === 0) return null;

  // Calculate map center based on places
  const centerLat = places.reduce((sum, place) => sum + place.lat, 0) / places.length;
  const centerLng = places.reduce((sum, place) => sum + place.lng, 0) / places.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
        <DialogHeader className="p-4 pb-2 border-b">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg font-semibold flex items-center">
              <MapPin className="w-5 h-5 text-green-600 mr-2" />
              {t("home.quickActions.nearbyAlerts")}
            </DialogTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleUserLocation}
              className={`${showUserLocation ? 'bg-blue-100 text-blue-700' : ''}`}
            >
              <Navigation className="w-4 h-4 mr-1" />
              {t("common.myLocation")}
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 relative bg-gray-100">
          {/* Simple map placeholder with points */}
          <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-gradient-to-br from-green-50 to-blue-50">
            
            {/* Map Grid Background */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `
                linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }} />

            {/* Places on Map */}
            <div className="relative w-full h-full">
              {places.map((place, index) => {
                // Simple positioning based on index for demo
                const x = 30 + (index * 15) + Math.random() * 20;
                const y = 30 + (index * 10) + Math.random() * 30;
                
                return (
                  <div
                    key={place.id || index}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${x}%`, top: `${y}%` }}
                  >
                    {/* Proximity Number Badge */}
                    <div className="relative">
                      <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                        <span className="text-sm font-bold">{index + 1}</span>
                      </div>
                      
                      {/* Place info tooltip */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-white rounded shadow-lg border text-xs whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity z-10">
                        <div className="font-medium">{place.name}</div>
                        <div className="text-gray-500">
                          {typeof place.distance === 'string' 
                            ? place.distance 
                            : place.distance >= 1000 
                              ? `${(place.distance / 1000).toFixed(1)} km`
                              : `${Math.round(place.distance)} m`
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* User Location */}
              {showUserLocation && userLocation && (
                <div
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{ left: '50%', top: '60%' }}
                >
                  <div className="relative">
                    <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg animate-pulse" />
                    <div className="absolute inset-0 w-4 h-4 bg-blue-400 rounded-full animate-ping opacity-75" />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-blue-600 text-white rounded shadow-lg text-xs whitespace-nowrap">
                      {t("common.yourLocation")}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Map Legend */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-xs">
              <div className="font-medium mb-2">{t("common.legend")}:</div>
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-4 h-4 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                <span>{t("common.nearbyPlaces")}</span>
              </div>
              {showUserLocation && (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-blue-600 rounded-full" />
                  <span>{t("common.yourLocation")}</span>
                </div>
              )}
            </div>

            {/* Places Count */}
            <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 text-sm">
              <span className="font-medium">{places.length}</span>
              <span className="text-gray-500 ml-1">
                {places.length === 1 ? t("common.place") : t("common.places")}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NearbyPlacesMapModal;