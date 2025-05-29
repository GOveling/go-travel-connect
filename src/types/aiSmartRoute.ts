export interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "owner" | "editor" | "viewer";
}

export interface TripCoordinate {
  name: string;
  lat: number;
  lng: number;
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
  destinationName?: string;
  lat?: number;
  lng?: number;
}

export interface Trip {
  id: number;
  name: string;
  destination: string;
  dates: string;
  status: string;
  travelers: number;
  image: string;
  isGroupTrip: boolean;
  collaborators?: Collaborator[];
  coordinates: TripCoordinate[];
  description?: string;
  budget?: string;
  accommodation?: string;
  transportation?: string;
  savedPlaces?: SavedPlace[];
  savedPlacesByDestination?: { [key: string]: SavedPlace[] };
}

export interface OptimizedPlace {
  id: string;
  name: string;
  category: string;
  rating: number;
  image: string;
  description: string;
  estimatedTime: string;
  priority: "high" | "medium" | "low";
  lat: number;
  lng: number;
  aiRecommendedDuration: string;
  bestTimeToVisit: string;
  orderInRoute: number;
  destinationName: string;
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
}

export interface RouteConfiguration {
  name: string;
  description: string;
  duration: string;
  efficiency: string;
  itinerary: DayItinerary[];
}
