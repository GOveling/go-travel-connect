import { Dialog, DialogContent } from "@/components/ui/dialog";
import TripMapWrapper from "@/components/maps/TripMapWrapper";

interface Place {
  id: string;
  name: string;
  lat?: number;
  lng?: number;
  address?: string;
  places?: any[]; // For showing multiple places on map
}

interface PlaceLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  place: Place | null;
}

const PlaceLocationModal = ({
  isOpen,
  onClose,
  place,
}: PlaceLocationModalProps) => {
  if (!place) return null;

  // Handle multiple places (from Travel Mode nearby places)
  if (place.places && place.places.length > 0) {
    const mockTrip = {
      id: `nearby-places-${place.id}`,
      name: place.name,
      status: "planning",
      destination: {
        name: place.places[0].name,
        lat: place.places[0].lat,
        lng: place.places[0].lng,
      },
      coordinates: place.places.map((p: any, index: number) => ({
        id: `coord-${p.id || index}`,
        name: p.name,
        lat: p.lat,
        lng: p.lng,
        order_index: index,
        trip_id: `nearby-places-${place.id}`,
      })),
      saved_places: place.places.map((p: any, index: number) => ({
        id: `saved-${p.id || index}`,
        name: p.name,
        lat: p.lat,
        lng: p.lng,
        category: p.category || "point_of_interest",
        trip_id: `nearby-places-${place.id}`,
      })),
    };

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
          <div className="w-full h-full">
            <TripMapWrapper trips={[mockTrip]} />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Handle single place
  if (!place.lat || !place.lng) return null;

  // Convert place to trip format for the map component
  const mockTrip = {
    id: `place-${place.id}`,
    name: place.name,
    status: "planning",
    destination: {
      name: place.name,
      lat: place.lat,
      lng: place.lng,
    },
    coordinates: [
      {
        id: `coord-${place.id}`,
        name: place.name,
        lat: place.lat,
        lng: place.lng,
        order_index: 0,
        trip_id: `place-${place.id}`,
      },
    ],
    saved_places: [
      {
        id: `saved-${place.id}`,
        name: place.name,
        lat: place.lat,
        lng: place.lng,
        category: "point_of_interest",
        trip_id: `place-${place.id}`,
      },
    ],
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
        <div className="w-full h-full">
          <TripMapWrapper trips={[mockTrip]} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlaceLocationModal;
