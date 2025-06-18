
import { Trip, SavedPlace } from "@/types";
import { calculateTripStatus } from "@/utils/tripStatusUtils";

export const addPlaceToTripUtil = (
  trips: Trip[],
  tripId: number,
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
    destinationName: place.location || place.destinationName || "Unknown Location",
    lat: place.lat,
    lng: place.lng
  };

  return trips.map(trip => 
    trip.id === tripId 
      ? { ...trip, savedPlaces: [...(trip.savedPlaces || []), savedPlace] }
      : trip
  );
};

export const calculateTripsWithDynamicStatus = (trips: Trip[]) => {
  return trips.map(trip => ({
    ...trip,
    status: calculateTripStatus(trip.dates)
  }));
};

export const findCurrentTrip = (tripsWithStatus: Trip[]): Trip => {
  const travelingTrip = tripsWithStatus.find(trip => trip.status === 'traveling');
  const upcomingTrips = tripsWithStatus
    .filter(trip => trip.status === 'upcoming')
    .sort((a, b) => {
      const getStartDate = (dates: string) => {
        try {
          const startDateStr = dates.split(' - ')[0];
          const year = dates.split(', ')[1] || new Date().getFullYear().toString();
          const month = startDateStr.split(' ')[0];
          const day = parseInt(startDateStr.split(' ')[1]);
          
          const monthMap: { [key: string]: number } = {
            'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
            'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
          };
          
          return new Date(parseInt(year), monthMap[month], day);
        } catch {
          return new Date();
        }
      };
      
      return getStartDate(a.dates).getTime() - getStartDate(b.dates).getTime();
    });

  const nearestUpcomingTrip = upcomingTrips.find(trip => {
    try {
      const startDateStr = trip.dates.split(' - ')[0];
      const year = trip.dates.split(', ')[1] || new Date().getFullYear().toString();
      const month = startDateStr.split(' ')[0];
      const day = parseInt(startDateStr.split(' ')[1]);
      
      const monthMap: { [key: string]: number } = {
        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
      };
      
      const startDate = new Date(parseInt(year), monthMap[month], day);
      const currentDate = new Date();
      const daysDifference = Math.ceil((startDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return daysDifference <= 40 && daysDifference > 0;
    } catch {
      return false;
    }
  });

  return travelingTrip || nearestUpcomingTrip || {
    id: 1,
    name: "European Adventure",
    destination: "Paris → Rome → Barcelona",
    dates: "Dec 15 - Dec 25, 2024",
    status: "upcoming",
    travelers: 2,
    image: "🇪🇺",
    isGroupTrip: false,
    coordinates: [
      { name: "Paris", lat: 48.8566, lng: 2.3522 },
      { name: "Rome", lat: 41.9028, lng: 12.4964 },
      { name: "Barcelona", lat: 41.3851, lng: 2.1734 }
    ],
    description: "An amazing journey through three beautiful European cities with rich history, art, and culture.",
    budget: "$2,500 per person",
    accommodation: "Mix of boutique hotels and Airbnb",
    transportation: "Flights and high-speed trains",
    savedPlaces: []
  };
};
