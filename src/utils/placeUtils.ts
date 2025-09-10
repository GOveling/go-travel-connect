import { Trip, SavedPlace, OptimizedPlace } from "@/types/aiSmartRoute";
import { savedPlacesByDestination } from "./mockData";

export const getSavedPlacesByDestination = (trip: Trip | null) => {
  if (!trip) return {};

  const placesByDestination: { [key: string]: SavedPlace[] } = {};

  // First, check if trip has savedPlacesByDestination property
  if (trip.savedPlacesByDestination) {
    Object.keys(trip.savedPlacesByDestination).forEach((destinationName) => {
      placesByDestination[destinationName] =
        trip.savedPlacesByDestination![destinationName];
    });
  }

  // Then, check trip.savedPlaces and organize by destination
  if (trip.savedPlaces) {
    trip.savedPlaces.forEach((place) => {
      const destinationName = place.destinationName || trip.destination;
      if (!placesByDestination[destinationName]) {
        placesByDestination[destinationName] = [];
      }
      placesByDestination[destinationName].push(place);
    });
  }

  // Finally, fall back to mock data for destinations that have saved places in the system
  trip.coordinates.forEach((coordinate) => {
    if (
      !placesByDestination[coordinate.name] ||
      placesByDestination[coordinate.name].length === 0
    ) {
      const mockPlaces =
        savedPlacesByDestination[
          coordinate.name as keyof typeof savedPlacesByDestination
        ];
      if (mockPlaces) {
        placesByDestination[coordinate.name] = mockPlaces;
      }
    }
  });

  return placesByDestination;
};

export const convertToOptimizedPlaces = (
  places: SavedPlace[],
  routeType: string,
  destination: { lat: number; lng: number; name: string },
  allocatedDays: number
) => {
  return places.map((place, index) => ({
    ...place,
    lat: place.lat || destination.lat,
    lng: place.lng || destination.lng,
    destinationName: destination.name,
    // Remove visited references since it's now calculated per user
    visited: false, // Will be calculated dynamically per user
    aiRecommendedDuration:
      routeType === "speed"
        ? "1 hour"
        : routeType === "leisure"
          ? place.estimatedTime.split("-")[1]?.trim() || place.estimatedTime
          : place.estimatedTime.split("-")[0]?.trim() || place.estimatedTime,
    bestTimeToVisit:
      routeType === "speed"
        ? `${9 + index * 2}:00 ${index * 2 < 4 ? "AM" : "PM"}`
        : routeType === "leisure"
          ? index === 0
            ? "10:00 AM"
            : index === 1
              ? "3:00 PM"
              : "6:00 PM"
          : index === 0
            ? "9:00 AM"
            : index === 1
              ? "1:00 PM"
              : index === 2
                ? "4:00 PM"
                : "6:00 PM",
    orderInRoute: index + 1,
  }));
};

// Helper function to distribute places across multiple days
export const distributePlacesAcrossDays = (
  places: SavedPlace[],
  allocatedDays: number,
  routeType: string
) => {
  if (allocatedDays === 1) {
    return [places];
  }

  const placesPerDay = Math.ceil(places.length / allocatedDays);
  const dayGroups: SavedPlace[][] = [];

  for (let day = 0; day < allocatedDays; day++) {
    const startIndex = day * placesPerDay;
    const endIndex = Math.min(startIndex + placesPerDay, places.length);
    const dayPlaces = places.slice(startIndex, endIndex);

    if (dayPlaces.length > 0) {
      dayGroups.push(dayPlaces);
    }
  }

  return dayGroups;
};

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "low":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};
