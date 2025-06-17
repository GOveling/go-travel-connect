
// User and Authentication Types
export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

// Trip Related Types
export interface TripCoordinate {
  name: string;
  lat: number;
  lng: number;
}

export interface Collaborator {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: "owner" | "editor" | "viewer";
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

// AI Smart Route Types
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

// Auth Form Types
export interface UseAuthFormReturn {
  isSignUp: boolean;
  email: string;
  password: string;
  name: string;
  confirmPassword: string;
  showPassword: boolean;
  showConfirmPassword: boolean;
  isLoading: boolean;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;
  setName: (name: string) => void;
  setConfirmPassword: (password: string) => void;
  setShowPassword: (show: boolean) => void;
  setShowConfirmPassword: (show: boolean) => void;
  setIsLoading: (loading: boolean) => void;
  toggleMode: () => void;
  resetForm: () => void;
  isFormValid: boolean;
}

// Modal Props Types
export interface AuthGateProps {
  onAuthSuccess: () => void;
}

export interface CurrentTripProps {
  currentTrip: Trip | null;
  travelingTrip: Trip | null;
  nearestUpcomingTrip: Trip | null;
  onViewDetail?: () => void;
  onPlanNewTrip?: () => void;
  onNavigateToTrips?: () => void;
}

export interface AISmartRouteModalProps {
  trip: Trip | null;
  isOpen: boolean;
  onClose: () => void;
}

// Component Props Types
export interface TripMapProps {
  trips: Trip[];
}

export interface TripCardProps {
  trip: Trip;
  onViewDetails: (trip: Trip) => void;
  onEditTrip: (trip: Trip) => void;
  onInviteFriends: (trip: Trip) => void;
  onGroupOptions: (trip: Trip) => void;
  onAISmartRoute: (trip: Trip) => void;
  onViewSavedPlaces: (trip: Trip) => void;
  onCreatePhotobook: (trip: Trip) => void;
}
