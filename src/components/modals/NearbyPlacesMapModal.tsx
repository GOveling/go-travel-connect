import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocateFixed } from "lucide-react";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/useLanguage";

// Fix for default markers in React Leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom icon for user location
const userIcon = new L.Icon({
  iconUrl: `data:image/svg+xml;base64,${btoa(`
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="8" fill="#3b82f6" stroke="white" stroke-width="2"/>
      <circle cx="12" cy="12" r="3" fill="white"/>
    </svg>
  `)}`,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -12],
});

// Create numbered icons for nearby places
const createNumberedIcon = (number: number) => {
  return new L.Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg width="32" height="42" viewBox="0 0 32 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 0C7.16 0 0 7.16 0 16C0 24 16 42 16 42S32 24 32 16C32 7.16 24.84 0 16 0Z" fill="#16a34a"/>
        <circle cx="16" cy="16" r="10" fill="white"/>
        <text x="16" y="21" text-anchor="middle" fill="#16a34a" font-family="Arial, sans-serif" font-weight="bold" font-size="12">${number}</text>
      </svg>
    `)}`,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -42],
  });
};

interface NearbyPlace {
  id?: string;
  name: string;
  lat: number;
  lng: number;
  category?: string;
  distance?: number | string;
}

interface NearbyPlacesMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  places: NearbyPlace[];
}

const NearbyPlacesMapModal = ({
  isOpen,
  onClose,
  places,
}: NearbyPlacesMapModalProps) => {
  const { t } = useLanguage();
  const mapRef = useRef<L.Map | null>(null);
  const { location, isLocating, getCurrentLocation } = useUserLocation();
  const [showUserLocation, setShowUserLocation] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);
  const { toast } = useToast();

  // Handle user location toggle
  const handleToggleUserLocation = () => {
    if (!showUserLocation && !location) {
      getCurrentLocation()
        .then(() => {
          setShowUserLocation(true);
          setHasUserInteracted(true); // Mark as user interaction
          toast({
            title: t("common.success"),
            description: t("common.locationFound"),
          });
          
          // Zoom to user location when first activated (will happen after location is obtained)
          setTimeout(() => {
            if (mapRef.current && location) {
              mapRef.current.setView([location.lat, location.lng], 16);
            }
          }, 100);
        })
        .catch((error) => {
          console.error("Error getting location:", error);
          toast({
            title: t("common.error"),
            description: t("common.locationError"),
            variant: "destructive",
          });
        });
    } else {
      setShowUserLocation(!showUserLocation);
      if (showUserLocation) {
        setHasUserInteracted(true); // Mark as user interaction when toggling
      }
    }
  };

  // Center the map on the places - only auto-fit initially and when first enabling location
  useEffect(() => {
    if (mapRef.current && places.length > 0 && !hasUserInteracted) {
      const group = new L.FeatureGroup();
      
      places.forEach((place) => {
        group.addLayer(L.marker([place.lat, place.lng]));
      });

      if (showUserLocation && location) {
        group.addLayer(L.marker([location.lat, location.lng]));
      }

      try {
        mapRef.current.fitBounds(group.getBounds(), { 
          padding: [20, 20],
          maxZoom: 15 
        });
      } catch (error) {
        console.warn("Error fitting bounds:", error);
        // Fallback to center on first place
        if (places[0]) {
          mapRef.current.setView([places[0].lat, places[0].lng], 13);
        }
      }
    }
  }, [places, showUserLocation, location, hasUserInteracted]);

  // Add map interaction listeners to prevent auto-zoom after user interacts
  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current;
      
      const handleMapInteraction = () => {
        setHasUserInteracted(true);
      };

      map.on('zoom', handleMapInteraction);
      map.on('drag', handleMapInteraction);
      map.on('click', handleMapInteraction);

      return () => {
        map.off('zoom', handleMapInteraction);
        map.off('drag', handleMapInteraction);
        map.off('click', handleMapInteraction);
      };
    }
  }, []);

  if (!places || places.length === 0) {
    return null;
  }

  // Calculate center point
  const centerLat = places.reduce((sum, place) => sum + place.lat, 0) / places.length;
  const centerLng = places.reduce((sum, place) => sum + place.lng, 0) / places.length;
  const center: [number, number] = [centerLat, centerLng];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[70vh] p-0 border-0 rounded-[5px]">
        <div className="relative w-full h-full rounded-[5px] overflow-hidden">
          <MapContainer
            center={center}
            zoom={places.length === 1 ? 16 : 12}
            style={{ height: "100%", width: "100%" }}
            zoomControl={true}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Render nearby places with numbered markers */}
            {places.map((place, index) => (
              <Marker
                key={place.id || index}
                position={[place.lat, place.lng]}
                icon={createNumberedIcon(index + 1)}
              >
                <Popup>
                  <div className="text-center">
                    <h3 className="font-semibold text-gray-900">{place.name}</h3>
                    {place.category && (
                      <p className="text-sm text-gray-600 mt-1">{place.category}</p>
                    )}
                    {place.distance && (
                      <p className="text-sm text-green-600 font-medium mt-1">
                        {typeof place.distance === 'string' 
                          ? place.distance 
                          : place.distance >= 1000 
                            ? `${(place.distance / 1000).toFixed(1)} km`
                            : `${Math.round(place.distance)} m`
                        }
                      </p>
                    )}
                  </div>
                </Popup>
              </Marker>
            ))}

            {/* User location marker and accuracy circle */}
            {showUserLocation && location && (
              <>
                <Marker position={[location.lat, location.lng]} icon={userIcon}>
                  <Popup>
                    <div className="text-center">
                      <h3 className="font-semibold text-blue-900">{t("common.yourLocation")}</h3>
                    </div>
                  </Popup>
                </Marker>
                <Circle
                  center={[location.lat, location.lng]}
                  radius={location.accuracy || 50}
                  pathOptions={{
                    color: "#3b82f6",
                    fillColor: "#3b82f6",
                    fillOpacity: 0.15,
                  }}
                />
              </>
            )}
          </MapContainer>

          {/* User location toggle button */}
          <div className="absolute top-3 right-3 z-[1000]">
            <Button
              size="sm"
              variant={showUserLocation ? "default" : "outline"}
              onClick={handleToggleUserLocation}
              disabled={isLocating}
              className={showUserLocation 
                ? "backdrop-blur-sm shadow-md" 
                : "bg-white/90 backdrop-blur-sm border shadow-md hover:bg-white"
              }
            >
              <LocateFixed className="w-4 h-4 mr-1" />
              {showUserLocation
                ? t("common.hideLocation")
                : isLocating
                  ? t("common.locating")
                  : t("common.myLocation")}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NearbyPlacesMapModal;