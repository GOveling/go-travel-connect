// New API types for AI Smart Route V2 - keeps existing types unaffected

export interface ApiPlace {
  id: string;
  name: string;
  category: string;
  rating: number;
  image: string;
  description: string;
  estimated_time: string;
  priority: number;
  lat: number;
  lng: number;
  recommended_duration: string;
  best_time: string;
  order: number;
  is_intercity: boolean;
  quality_flag?: string | null;
  // Transfer-specific fields when category is "transfer"
  from_lat?: number;
  from_lng?: number;
  to_lat?: number;
  to_lng?: number;
  from_place?: string;
  to_place?: string;
  distance_km?: number;
  transport_mode?: string;
}

export interface Transfer {
  type: "intercity_transfer";
  from: string;
  to: string;
  from_lat: number;
  from_lon: number;
  to_lat: number;
  to_lon: number;
  distance_km: number;
  duration_minutes: number;
  mode: "flight" | "drive" | "transit" | "walk" | "bike";
  time: string;
  overnight: boolean;
  has_activity?: boolean;
  is_between_days?: boolean;
  description?: string;
}

export interface BaseAccommodation {
  name: string;
  lat: number;
  lon: number;
  address: string;
  rating: number;
  type: "accommodation" | "hotel_from_cluster" | "virtual_base" | "smart_centroid";
  place_id?: string;
  price_level?: number;
  auto_recommended: boolean;
  recommendation_source: "auto_recommended_by_system" | "user_provided" | "auto_detected_in_original_places";
  reference_place?: string | null;
}

export interface FreeBlockSuggestion {
  name: string;
  lat: number;
  lon: number;
  type: string;
  rating: number;
  eta_minutes: number;
  reason: string;
  synthetic: boolean;
  source: string;
  place_id?: string;
  vicinity?: string;
  user_ratings_total?: number;
  distance_km: number;
  price_level?: number;
}

export interface FreeBlock {
  start_time: number;
  end_time: number;
  duration_minutes: number;
  suggestions: FreeBlockSuggestion[];
  note: string;
}

export interface IntercityTransfer {
  from: string;
  to: string;
  distance_km: number;
  estimated_time_hours: number;
  mode: "flight" | "drive" | "transit";
  overnight: boolean;
}

export interface OptimizationMetrics {
  efficiency_score: number;
  optimization_mode: string;
  fallback_active: boolean;
  total_distance_km: number;
  total_travel_time_minutes: number;
  walking_time_minutes: number;
  transport_time_minutes: number;
  long_transfers_detected: number;
  intercity_transfers: IntercityTransfer[];
  total_intercity_time_hours: number;
  total_intercity_distance_km: number;
  processing_time_seconds: number;
  hotels_provided: boolean;
  hotels_count: number;
}

export interface ApiDayItinerary {
  day: number;
  date: string;
  places: ApiPlace[];
  transfers: Transfer[];
  base: BaseAccommodation;
  free_blocks: FreeBlock[];
  total_time: string;
  walking_time: string;
  transport_time: string;
  free_time: string;
  is_suggested: boolean;
  is_tentative: boolean;
}

export interface ApiItineraryResponse {
  itinerary: ApiDayItinerary[];
  optimization_metrics: OptimizationMetrics;
  recommendations: string[];
}

export interface GenerateHybridItineraryParamsV2 {
  places: Array<{
    place_id?: string; // Google Places ID when available
    name: string;
    lat: number;
    lon: number;
    type: string;
    rating?: number;
    address?: string;
    category?: string;
    description?: string;
    estimated_time?: string;
    priority: number;
    user_ratings_total?: number;
    price_level?: number;
  }>;
  start_date: string;
  end_date: string;
  transport_mode: 'walk' | 'drive' | 'transit' | 'bike';
  daily_start_hour?: number;
  daily_end_hour?: number;
  accommodations?: Array<{
    name: string;
    lat: number;
    lon: number;
    place_id?: string;
    type?: string;
    rating?: number;
    address?: string;
  }>;
}
