import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in React Leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.divIcon({
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
  lat?: number;
  lng?: number;
  address?: string;
}

interface PlaceMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  place: Place | null;
}

const PlaceMapModal = ({ isOpen, onClose, place }: PlaceMapModalProps) => {
  const mapRef = useRef<any>(null);

  useEffect(() => {
    // Clean up the map when component unmounts
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
    };
  }, []);

  if (!place || !place.lat || !place.lng) return null;

  const position: [number, number] = [place.lat, place.lng];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl w-full h-[60vh] p-0 border-0 rounded-[5px]">
        <div className="w-full h-full rounded-[5px] overflow-hidden">
          <MapContainer
            center={position}
            zoom={16}
            style={{ height: "100%", width: "100%" }}
            zoomControl={true}
            ref={mapRef}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={position} icon={DefaultIcon}>
              <Popup>
                <div className="text-center">
                  <h3 className="font-semibold text-sm">{place.name}</h3>
                  {place.address && (
                    <p className="text-xs text-gray-600 mt-1">
                      {place.address}
                    </p>
                  )}
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlaceMapModal;
