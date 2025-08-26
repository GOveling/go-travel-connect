import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

interface Place {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  category: string;
}

interface ExploreMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  places: Place[];
}

const ExploreMapModal = ({ isOpen, onClose, places }: ExploreMapModalProps) => {
  const mapRef = useRef<any>(null);

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
            zoomControl={false}
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
                  <div className="text-center">
                    <h3 className="font-semibold text-sm">{place.name}</h3>
                    <p className="text-xs text-gray-600 mt-1">{place.address}</p>
                    <p className="text-xs text-blue-600 font-medium mt-1">{place.category}</p>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExploreMapModal;