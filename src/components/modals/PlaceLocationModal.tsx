import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TripMapWrapper from "@/components/maps/TripMapWrapper";

interface Place {
  id: string;
  name: string;
  lat?: number;
  lng?: number;
  address?: string;
}

interface PlaceLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  place: Place | null;
}

const PlaceLocationModal = ({ isOpen, onClose, place }: PlaceLocationModalProps) => {
  if (!place || !place.lat || !place.lng) return null;

  // Convert place to trip format for the map component
  const mockTrip = {
    id: `place-${place.id}`,
    name: place.name,
    status: 'planning',
    destination: {
      name: place.name,
      lat: place.lat,
      lng: place.lng
    },
    coordinates: [{
      id: `coord-${place.id}`,
      name: place.name,
      lat: place.lat,
      lng: place.lng,
      order_index: 0,
      trip_id: `place-${place.id}`
    }],
    saved_places: [{
      id: `saved-${place.id}`,
      name: place.name,
      lat: place.lat,
      lng: place.lng,
      category: 'point_of_interest',
      trip_id: `place-${place.id}`
    }]
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh]">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Ubicación: {place.name}
          </DialogTitle>
          {place.address && (
            <p className="text-sm text-muted-foreground">{place.address}</p>
          )}
        </DialogHeader>
        
        <div className="flex-1 h-full">
          <TripMapWrapper trips={[mockTrip]} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlaceLocationModal;