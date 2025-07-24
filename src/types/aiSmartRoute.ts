export interface Trip {
  id: string;
  name: string;
  destination: string;
  dates: string;
  status: string;
  travelers: number;
  image: string;
  isGroupTrip: boolean;
  collaborators?: Array<{
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: "owner" | "editor" | "viewer";
  }>;
  coordinates: Array<{
    name: string;
    lat: number;
    lng: number;
  }>;
  description?: string;
  budget?: string;
  accommodation?: string;
  transportation?: string;
  savedPlaces?: SavedPlace[];
  savedPlacesByDestination?: { [key: string]: SavedPlace[] };
}

export interface SavedPlace {
  id: string;
  name: string;
  category: string;
  rating: number;
  image: string;
  description: string;
  estimatedTime: string;
  priority: "high" | "medium" | "low";
  destinationName: string;
  lat?: number;
  lng?: number;
}

export interface OptimizedPlace extends SavedPlace {
  lat: number;
  lng: number;
  destinationName: string;
  aiRecommendedDuration: string;
  bestTimeToVisit: string;
  orderInRoute: number;
}

export interface DayItinerary {
  day: number;
  date: string;
  destinationName: string;
  places: OptimizedPlace[];
  totalTime: string;
  walkingTime: string;
  transportTime: string;
  freeTime: string;
  allocatedDays: number;
  isSuggested?: boolean;
  isTentative?: boolean; // NEW: For tentative itineraries when no saved places exist
}

export interface RouteConfiguration {
  name: string;
  description: string;
  duration: string;
  efficiency: string;
  itinerary: DayItinerary[];
}
