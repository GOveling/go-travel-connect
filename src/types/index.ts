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
  destinationName: string;
  lat?: number;
  lng?: number;
  position_order?: number; // legacy snake_case
  positionOrder?: number; // preferred camelCase
  // Address hierarchy (optional)
  formattedAddress?: string;
  addressJson?: any;
  country?: string;
  state?: string;
  region?: string;
  city?: string;
  district?: string;
  neighborhood?: string;
  postalCode?: string;
  street?: string;
  streetNumber?: string;
  placeSource?: string;
  placeReference?: string;
  // Visit tracking
  visited?: boolean;
  visitedAt?: string;
  visitDistance?: number;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  dates?: string; // Derived display range
  startDate?: Date; // Start date as Date object
  endDate?: Date; // End date as Date object
  status: string;
  travelers: number;
  image: string;
  isGroupTrip: boolean;
  user_id?: string; // Trip owner ID
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
  isTentative?: boolean;
}

export interface RouteConfiguration {
  name: string;
  description: string;
  duration: string;
  efficiency: string;
  itinerary: DayItinerary[];
}

// Home State Types
export interface InstaTripImage {
  id: string;
  src: string;
  addedAt: number;
  text?: string;
  location?: string;
  tripId?: string;
}

export interface ProfilePost {
  id: string;
  images: string[];
  text: string;
  createdAt: number;
  location?: string;
  tripId?: string;
}

export interface FriendPublication {
  id: string;
  friendName: string;
  friendAvatar?: string;
  images: string[];
  text: string;
  createdAt: number;
  location?: string;
  likes: number;
  comments: number;
  liked: boolean;
}

// Traveler Types
export interface TripHistory {
  name: string;
  destinations: string;
  year: string;
  rating: number;
}

export interface Review {
  place: string;
  rating: number;
  text: string;
}

export interface Publication {
  id: string;
  images: string[];
  text: string;
  location?: string;
  createdAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  earned: boolean;
  progress: number;
  total: number;
  points: number;
  earnedDate?: string;
}

export interface TravelLevel {
  level: number;
  title: string;
  currentXP: number;
  nextLevelXP: number;
}

export interface Traveler {
  id: string;
  name: string;
  avatar: string;
  location: string;
  totalTrips: number;
  countries: number;
  followers: number;
  following: number;
  bio: string;
  pastTrips: TripHistory[];
  recentPhotos: string[];
  reviews: Review[];
  publications: Publication[];
  achievements: Achievement[];
  travelLevel: TravelLevel;
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

export interface AddMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddInstaTripImage?: (
    image: string,
    text?: string,
    location?: string,
    tripId?: string
  ) => void;
  onCreatePublication?: () => void;
  onOpenTripPhotobook?: (trip: Trip) => void;
  trips?: Trip[];
}

export interface AISmartRouteModalProps {
  trip: Trip | null;
  isOpen: boolean;
  onClose: () => void;
}

export interface AddToTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingTrips: Trip[];
  onAddToExistingTrip: (tripId: string) => void;
  onCreateNewTrip: () => void;
  postLocation?: string;
}

// Component Props Types
export interface TripMapProps {
  trips: Trip[];
}

export interface TravelerCardProps {
  traveler: Traveler;
  isFollowing: boolean;
  onFollow: (userId: string) => void;
}

export interface TripCardProps {
  trip: Trip;
  onViewDetails: (trip: Trip) => void;
  onEditTrip: (trip: Trip) => void;
  onInviteFriends: (trip: Trip) => void;
  onGroupOptions: (trip: Trip) => void;
  onAISmartRoute: (trip: Trip) => void;
  onViewSavedPlaces: (trip: Trip) => void;
  onDeleteTrip?: (trip: Trip) => void;
  onAddAccommodation?: (trip: Trip) => void;
}

export interface ProfilePublicationProps {
  posts: ProfilePost[];
  onProfilePublicationClick: () => void;
  onAddToTrip: (post: ProfilePost) => void;
  formatTimeAgo: (timestamp: number) => string;
}

export interface FollowedFriendsPublicationsProps {
  publications: FriendPublication[];
  onLike: (id: string) => void;
  onComment: (id: string) => void;
  onShare: (id: string) => void;
  formatTimeAgo: (timestamp: number) => string;
  trips?: Trip[];
  onAddToExistingTrip?: (tripId: string, place: any) => void;
  onCreateNewTrip?: (tripData: any) => void;
}
