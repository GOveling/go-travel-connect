// Navigation and Turn-by-Turn Types

export interface TransitStep {
  type: 'transit';
  instruction: string;
  distance: string;
  duration: string;
  transit_details: {
    departure_stop: {
      name: string;
      location: { lat: number; lng: number };
    };
    arrival_stop: {
      name: string;
      location: { lat: number; lng: number };
    };
    line: {
      name: string;
      short_name: string;
      color: string;
      vehicle: {
        type: 'BUS' | 'SUBWAY' | 'TRAIN' | 'TRAM' | 'FERRY';
        name: string;
        icon: string;
      };
    };
    departure_time?: {
      text: string;
      value: number;
    };
    arrival_time?: {
      text: string;
      value: number;
    };
    waiting_duration?: string;
    headsign?: string;
    num_stops?: number;
  };
}

export interface WalkingDrivingStep {
  type: 'walking' | 'driving';
  instruction: string;
  distance: string;
  duration: string;
  maneuver?: string;
  street_name?: string;
  start_location: { lat: number; lng: number };
  end_location: { lat: number; lng: number };
  polyline?: {
    points: string;
  };
}

export type NavigationStep = TransitStep | WalkingDrivingStep;

export interface EnhancedDirectionsResult {
  distance: string;
  duration: string;
  steps: NavigationStep[];
  route_polyline: string;
  coordinates: Array<{ lat: number; lng: number }>;
  departure_time?: string;
  arrival_time?: string;
  total_walking_distance?: string;
  fare?: {
    currency: string;
    value: number;
    text: string;
  };
  warnings?: string[];
}

export interface NavigationLeg {
  origin: {
    location: { lat: number; lng: number };
    name: string;
    place_id?: string;
  };
  destination: {
    location: { lat: number; lng: number };
    name: string;
    place_id?: string;
  };
  mode: 'walking' | 'driving' | 'transit' | 'bicycling';
  result: EnhancedDirectionsResult;
  status: 'pending' | 'active' | 'completed' | 'skipped';
  estimated_start_time?: string;
  estimated_arrival_time?: string;
  actual_start_time?: string;
  actual_arrival_time?: string;
}

export interface ActiveRoute {
  id: string;
  trip_id: string;
  date: string;
  legs: NavigationLeg[];
  current_leg_index: number;
  status: 'inactive' | 'active' | 'paused' | 'completed';
  created_at: string;
  started_at?: string;
  completed_at?: string;
  total_distance: string;
  total_duration: string;
  progress_percentage: number;
}

export interface RouteProgress {
  current_leg: NavigationLeg;
  current_step_index: number;
  distance_to_next_step: number;
  distance_to_destination: number;
  estimated_time_to_destination: number;
  is_on_route: boolean;
  deviation_distance?: number;
  last_known_location: { lat: number; lng: number };
  snap_to_route_location?: { lat: number; lng: number };
}

export interface VenueSize {
  place_id: string;
  category: string;
  arrival_radius: number; // meters
  venue_type: 'small' | 'medium' | 'large' | 'extra_large';
  confidence: number;
}

export interface ClusterSuggestion {
  cluster_id: string;
  places: Array<{
    id: string;
    name: string;
    location: { lat: number; lng: number };
    category: string;
    estimated_visit_duration: number;
  }>;
  center_location: { lat: number; lng: number };
  radius: number;
  estimated_total_time: number;
  recommended_order: string[];
  reason: string;
}

export interface NavigationEvent {
  type: 'leg_started' | 'leg_completed' | 'step_completed' | 'arrived_at_destination' | 'route_deviation' | 'recalculation_suggested';
  timestamp: string;
  leg_index?: number;
  step_index?: number;
  location: { lat: number; lng: number };
  data?: any;
}