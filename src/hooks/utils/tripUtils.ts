import { Trip, SavedPlace } from "@/types";
import { calculateTripStatus } from "@/utils/tripStatusUtils";

export const addPlaceToTripUtil = (
  trips: Trip[],
  tripId: string,
  place: any
): Trip[] => {
  const savedPlace: SavedPlace = {
    id: Date.now().toString(),
    name: place.name,
    category: place.category,
    rating: place.rating || 4.5,
    image: place.image || "📍",
    description: place.description || "",
    estimatedTime: "2-3 hours",
    priority: "medium" as const,
    destinationName:
      place.location || place.destinationName || "Unknown Location",
    lat: place.lat,
    lng: place.lng,
  };

  return trips.map((trip) =>
    trip.id === tripId
      ? { ...trip, savedPlaces: [...(trip.savedPlaces || []), savedPlace] }
      : trip
  );
};

export const calculateTripsWithDynamicStatus = (trips: Trip[]) => {
  return trips.map((trip) => ({
    ...trip,
    status: calculateTripStatus(trip),
  }));
};

export const findCurrentTrip = (tripsWithStatus: Trip[]): Trip => {
  const travelingTrip = tripsWithStatus.find(
    (trip) => trip.status === "traveling"
  );
  const upcomingTrips = tripsWithStatus
    .filter((trip) => trip.status === "upcoming")
    .sort((a, b) => {
      const aTime = a.startDate ? a.startDate.getTime() : Number.MAX_SAFE_INTEGER;
      const bTime = b.startDate ? b.startDate.getTime() : Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });

  const nearestUpcomingTrip = upcomingTrips.find((trip) => {
    try {
      const startDate = trip.startDate;
      if (!startDate) return false;

      const currentDate = new Date();
      const daysDifference = Math.ceil(
        (startDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      return daysDifference <= 40 && daysDifference > 0;
    } catch {
      return false;
    }
  });

  return (
    travelingTrip ||
    nearestUpcomingTrip || {
      id: "1",
      name: "European Adventure",
      destination: "Paris → Rome → Barcelona",
      startDate: new Date('2024-12-15'),
      endDate: new Date('2024-12-25'),
      status: "upcoming",
      travelers: 2,
      image: "🇪🇺",
      isGroupTrip: false,
      coordinates: [
        { name: "Paris", lat: 48.8566, lng: 2.3522 },
        { name: "Rome", lat: 41.9028, lng: 12.4964 },
        { name: "Barcelona", lat: 41.3851, lng: 2.1734 },
      ],
      description:
        "An amazing journey through three beautiful European cities with rich history, art, and culture.",
      budget: "$2,500 per person",
      accommodation: "Mix of boutique hotels and Airbnb",
      transportation: "Flights and high-speed trains",
      savedPlaces: [],
    }
  );
};
