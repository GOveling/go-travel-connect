import type { SavedPlace, Trip } from "@/types";
import { govelingMLConfig, getApiEndpointUrl, debugLog } from "@/config/govelingML";

// API Configuration
const API_BASE_URL = govelingMLConfig.baseUrl;
const API_VERSION = govelingMLConfig.apiVersion;

// Types for Goveling ML API - Updated to match your actual API
export interface GovelingMLPlace {
  name: string;
  lat: number;
  lon: number;
  type: string;
  priority: number;
}

export interface GovelingMLRequest {
  places: GovelingMLPlace[];
  start_date: string; // YYYY-MM-DD format
  end_date: string; // YYYY-MM-DD format
  daily_start_hour: number;
  daily_end_hour: number;
  transport_mode: string;
}

// Legacy types for backward compatibility
export interface GovelingMLActivity {
  name: string;
  address?: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  category: string;
  priority: number; // 1-10, where 10 is highest priority
  estimated_duration?: number; // hours
  opening_hours?: string;
  is_hotel?: boolean;
  check_in?: string; // YYYY-MM-DD format
  check_out?: string; // YYYY-MM-DD format
}

export interface GovelingMLPreferences {
  start_time?: string; // "09:00"
  end_time?: string; // "18:00"
  max_daily_activities?: number;
  preferred_transport?: "walking" | "driving" | "transit";
}

export interface GovelingMLUserLocation {
  latitude: number;
  longitude: number;
}

export interface GovelingMLTransportInfo {
  mode: string;
  duration: number;
  distance: string;
}

export interface GovelingMLItineraryActivity {
  activity: GovelingMLActivity;
  scheduled_time: string;
  duration: number;
  transport_to_next?: GovelingMLTransportInfo;
}

export interface GovelingMLDayItinerary {
  day: number;
  date: string;
  activities: GovelingMLItineraryActivity[];
}

export interface GovelingMLAnalytics {
  total_activities: number;
  total_days: number;
  optimization_efficiency: number;
  optimization_mode: string;
  transport_recommendations: {
    walking: number;
    driving: number;
    transit: number;
  };
}

export interface GovelingMLMetadata {
  generation_time: number;
  api_version: string;
  ml_model_version: string;
}

export interface GovelingMLResponse {
  itinerary: GovelingMLDayItinerary[];
  analytics: GovelingMLAnalytics;
  metadata: GovelingMLMetadata;
}

// Error types
export class GovelingMLError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = "GovelingMLError";
  }
}

// Service class
export class GovelingMLService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Check API health status
   */
  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    const url = getApiEndpointUrl(govelingMLConfig.healthEndpoint);
    debugLog(`Health check request to: ${url}`);
    
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        signal: AbortSignal.timeout(govelingMLConfig.timeout),
      });

      if (!response.ok) {
        throw new GovelingMLError(
          response.status,
          `Health check failed: ${response.statusText}`
        );
      }

      const data = await response.json();
      debugLog("Health check successful", data);
      return data;
    } catch (error) {
      debugLog("Health check failed", error);
      if (error instanceof GovelingMLError) {
        throw error;
      }
      throw new GovelingMLError(
        500,
        `Network error during health check: ${error}`
      );
    }
  }

  /**
   * Generate hybrid itinerary using ML optimization
   */
  async generateHybridItinerary(
    request: GovelingMLRequest
  ): Promise<GovelingMLResponse> {
    const url = getApiEndpointUrl(govelingMLConfig.generateEndpoint);
    debugLog(`Itinerary generation request to: ${url}`, request);
    
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(govelingMLConfig.timeout),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        debugLog("API request failed", { status: response.status, errorData });
        throw new GovelingMLError(
          response.status,
          `API request failed: ${response.statusText}`,
          errorData
        );
      }

      const data = await response.json();
      debugLog("Itinerary generation successful", data);
      return data;
    } catch (error) {
      debugLog("Itinerary generation failed", error);
      if (error instanceof GovelingMLError) {
        throw error;
      }
      throw new GovelingMLError(
        500,
        `Network error during itinerary generation: ${error}`
      );
    }
  }

  /**
   * Transform Trip and SavedPlaces to Goveling ML format (your actual API format)
   */
  static transformTripToGovelingML(
    trip: Trip,
    preferences?: Partial<GovelingMLPreferences>,
    userLocation?: GovelingMLUserLocation
  ): GovelingMLRequest {
    const places: GovelingMLPlace[] = [];

    // Transform saved places to your API format
    if (trip.savedPlaces && trip.savedPlaces.length > 0) {
      trip.savedPlaces.forEach((place) => {
        if (place.lat && place.lng) {
          places.push({
            name: place.name,
            lat: place.lat,
            lon: place.lng, // Note: your API uses 'lon', not 'lng'
            type: GovelingMLService.mapCategoryToType(place.category),
            priority: GovelingMLService.mapPriorityToNumber(place.priority),
          });
        }
      });
    }

    // Add trip destinations as potential places if no saved places
    if (places.length === 0 && trip.coordinates.length > 0) {
      trip.coordinates.forEach((coord, index) => {
        places.push({
          name: coord.name,
          lat: coord.lat,
          lon: coord.lng,
          type: "attraction",
          priority: 8, // Default high priority for main destinations
        });
      });
    }

    // Calculate dates
    const startDate = trip.startDate ? 
      trip.startDate.toISOString().split('T')[0] : 
      new Date().toISOString().split('T')[0];
    
    const endDate = trip.endDate ? 
      trip.endDate.toISOString().split('T')[0] : 
      new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // +2 days

    // Map transport mode
    const transportMode = preferences?.preferred_transport === "walking" ? "walk" :
                         preferences?.preferred_transport === "driving" ? "drive" :
                         preferences?.preferred_transport === "transit" ? "transit" : "walk";

    return {
      places,
      start_date: startDate,
      end_date: endDate,
      daily_start_hour: preferences?.start_time ? parseInt(preferences.start_time.split(':')[0]) : 9,
      daily_end_hour: preferences?.end_time ? parseInt(preferences.end_time.split(':')[0]) : 18,
      transport_mode: transportMode,
    };
  }

  /**
   * Transform Goveling ML response to internal DayItinerary format
   */
  static transformGovelingMLResponse(
    response: GovelingMLResponse,
    trip: Trip
  ): {
    itinerary: any[];
    analytics: GovelingMLAnalytics;
    metadata: GovelingMLMetadata;
  } {
    const transformedItinerary = response.itinerary.map((day) => ({
      day: day.day,
      date: day.date,
      destinationName: trip.destination,
      places: day.activities.map((activity, index) => ({
        id: `${day.day}-${index}`,
        name: activity.activity.name,
        category: activity.activity.category,
        rating: 4.5, // Default rating
        image: "/placeholder.svg", // Default image
        description: `Scheduled for ${activity.scheduled_time}, duration: ${activity.duration}h`,
        estimatedTime: `${activity.duration}h`,
        priority: GovelingMLService.mapNumberToPriority(
          activity.activity.priority
        ),
        lat: activity.activity.coordinates.latitude,
        lng: activity.activity.coordinates.longitude,
        aiRecommendedDuration: `${activity.duration}h`,
        bestTimeToVisit: activity.scheduled_time,
        orderInRoute: index + 1,
        destinationName: trip.destination,
        transport_to_next: activity.transport_to_next,
      })),
      totalTime: `${day.activities.reduce(
        (total, act) => total + act.duration,
        0
      )}h`,
      walkingTime: day.activities
        .filter((act) => act.transport_to_next?.mode === "walking")
        .reduce((total, act) => total + (act.transport_to_next?.duration || 0), 0)
        .toFixed(1) + "h",
      transportTime: day.activities
        .filter((act) => act.transport_to_next?.mode !== "walking")
        .reduce((total, act) => total + (act.transport_to_next?.duration || 0), 0)
        .toFixed(1) + "h",
      freeTime: "2h", // Default free time
      allocatedDays: 1,
    }));

    return {
      itinerary: transformedItinerary,
      analytics: response.analytics,
      metadata: response.metadata,
    };
  }

  /**
   * Map priority string to number (1-10)
   */
  private static mapPriorityToNumber(priority: "high" | "medium" | "low"): number {
    switch (priority) {
      case "high":
        return 9;
      case "medium":
        return 6;
      case "low":
        return 3;
      default:
        return 6;
    }
  }

  /**
   * Map category to type for your API
   */
  private static mapCategoryToType(category: string): string {
    const categoryLower = category.toLowerCase();
    
    // Map common categories to your API's expected types
    const categoryMap: { [key: string]: string } = {
      'restaurant': 'restaurant',
      'food': 'restaurant',
      'dining': 'restaurant',
      'museum': 'museum',
      'attraction': 'monument',
      'monument': 'monument',
      'park': 'monument',
      'church': 'church',
      'cathedral': 'church',
      'temple': 'church',
      'shopping': 'shopping_mall',
      'mall': 'shopping_mall',
      'market': 'shopping_mall',
      'beach': 'beach',
      'hotel': 'hotel',
      'lodging': 'hotel',
      'accommodation': 'hotel',
    };

    return categoryMap[categoryLower] || 'monument'; // Default to monument
  }

  /**
   * Map priority number to string
   */
  private static mapNumberToPriority(priority: number): "high" | "medium" | "low" {
    if (priority >= 8) return "high";
    if (priority >= 5) return "medium";
    return "low";
  }

  /**
   * Parse estimated time string to hours
   */
  private static parseEstimatedTime(timeString: string): number {
    const hourMatch = timeString.match(/(\d+(?:\.\d+)?)\s*h/i);
    if (hourMatch) {
      return parseFloat(hourMatch[1]);
    }
    
    const minMatch = timeString.match(/(\d+)\s*min/i);
    if (minMatch) {
      return parseInt(minMatch[1]) / 60;
    }

    // Default to 2 hours if cannot parse
    return 2;
  }
}

// Export default instance
export const govelingMLService = new GovelingMLService();
