import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { LocateFixed, Info } from "lucide-react";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useToast } from "@/hooks/use-toast";
import PlaceDetailModal from "@/components/modals/PlaceDetailModal";

// Custom icon for search results
const resultIcon = L.divIcon({
  html: `<div style="
    background-color: #e11d48;
    width: 20px;
    height: 20px;
    border-radius: 50% 50% 50% 0;
    border: 2px solid white;
    transform: rotate(-45deg);
    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
  "></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 20],
  className: "custom-div-icon",
});

// User location icon
const userIcon = L.divIcon({
  html: `<div style="
    background-color: #3b82f6;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    box-shadow: 0 0 0 4px rgba(59,130,246,0.25);
    border: 2px solid white;
  "></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  className: "custom-user-icon",
});

interface Place {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  category: string;
  rating?: number;
  image?: string;
  description?: string;
  hours?: string;
  phone?: string;
  website?: string;
  priceLevel?: number;
  business_status?: string;
  photos?: string[];
  reviews_count?: number;
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
}

interface ExploreMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  places: Place[];
  sourceTrip?: any;
  onAddToTrip?: (place: any) => void;
}

const ExploreMapModal = ({ isOpen, onClose, places, sourceTrip, onAddToTrip }: ExploreMapModalProps) => {
  const mapRef = useRef<any>(null);
  const { location, getCurrentLocation, isLocating, error, startWatching, stopWatching } = useUserLocation();
  const { toast } = useToast();
  const [showUserLocation, setShowUserLocation] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [isPlaceDetailModalOpen, setIsPlaceDetailModalOpen] = useState(false);

  const handleToggleUserLocation = async () => {
    try {
      if (!showUserLocation) {
        await startWatching();
        const loc = await getCurrentLocation();
        if (loc && mapRef.current?.setView) {
          mapRef.current.setView([loc.lat, loc.lng], 16);
        }
      } else {
        await stopWatching();
      }
      setShowUserLocation((prev) => !prev);
    } catch (e) {
      toast({
        title: "Ubicación no disponible",
        description: error || "No se pudo obtener tu ubicación",
        variant: "destructive",
      });
    }
  };

  const handlePlaceClick = (place: Place) => {
    // Convert to enhanced format for modal, using the same logic as ExploreSection
    const enhancedPlace = {
      id: place.id,
      name: place.name,
      location: place.address,
      description: place.description || `${place.category} in ${place.address}`,
      rating: place.rating,
      image: place.image,
      category: place.category,
      hours: place.opening_hours?.open_now
        ? "Open now"
        : place.hours || "Hours vary",
      website: place.website || "",
      phone: place.phone || "",
      lat: place.coordinates.lat,
      lng: place.coordinates.lng,
      business_status: place.business_status,
      photos: place.photos || [],
      reviews_count: place.reviews_count,
      priceLevel: place.priceLevel,
      opening_hours: place.opening_hours,
    };

    setSelectedPlace(enhancedPlace);
    setIsPlaceDetailModalOpen(true);
  };

  const handleAddToTripFromModal = () => {
    if (onAddToTrip && selectedPlace) {
      onAddToTrip(selectedPlace);
      setIsPlaceDetailModalOpen(false);
    }
  };

  useEffect(() => {
    // Clean up the map when component unmounts
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (isOpen && places.length > 0 && mapRef.current) {
      // Fit map to show all places
      const markers = places.map(place => 
        L.marker([place.coordinates.lat, place.coordinates.lng])
      );
      const group = L.featureGroup(markers);
      
      if (places.length === 1) {
        // Single place - center and zoom
        mapRef.current.setView([places[0].coordinates.lat, places[0].coordinates.lng], 16);
      } else {
        // Multiple places - fit bounds
        mapRef.current.fitBounds(group.getBounds(), { padding: [20, 20] });
      }
    }
  }, [isOpen, places]);

  if (!places || places.length === 0) return null;

  // Calculate center point for initial map view
  const centerLat = places.reduce((sum, place) => sum + place.coordinates.lat, 0) / places.length;
  const centerLng = places.reduce((sum, place) => sum + place.coordinates.lng, 0) / places.length;
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
            {places.map((place) => (
              <Marker
                key={place.id}
                position={[place.coordinates.lat, place.coordinates.lng]}
                icon={resultIcon}
              >
                <Popup>
                  <div className="text-center min-w-[180px]">
                    <h3 className="font-semibold text-sm mb-1">{place.name}</h3>
                    <p className="text-xs text-gray-600 mb-1">{place.address}</p>
                    <p className="text-xs text-blue-600 font-medium mb-3">{place.category}</p>
                    <Button
                      size="sm"
                      onClick={() => handlePlaceClick(place)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 h-7"
                    >
                      <Info size={12} className="mr-1" />
                      Ver detalles
                    </Button>
                  </div>
                </Popup>
              </Marker>
            ))}

            {showUserLocation && location && (
              <>
                <Marker position={[location.lat, location.lng]} icon={userIcon} />
                <Circle
                  center={[location.lat, location.lng]}
                  radius={location.accuracy ?? 50}
                  pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.15 }}
                />
              </>
            )}
          </MapContainer>

          <div className="absolute top-3 right-3 z-[1000]">
            <Button
              size="sm"
              variant={showUserLocation ? "default" : "outline"}
              onClick={handleToggleUserLocation}
              className="h-9"
              disabled={isLocating}
            >
              <LocateFixed size={16} className="mr-2" />
              {showUserLocation ? "Ocultar ubicación" : isLocating ? "Localizando..." : "Mi ubicación"}
            </Button>
          </div>
        </div>

        {/* Place Detail Modal */}
        <PlaceDetailModal
          place={selectedPlace}
          isOpen={isPlaceDetailModalOpen}
          onClose={() => setIsPlaceDetailModalOpen(false)}
          onAddToTrip={handleAddToTripFromModal}
          sourceTrip={sourceTrip}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ExploreMapModal;