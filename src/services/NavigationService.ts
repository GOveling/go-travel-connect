// Navigation Service - Centralized navigation management

import { supabase } from "@/integrations/supabase/client";
import { ActiveRoute, NavigationLeg, EnhancedDirectionsResult, NavigationStep, RouteProgress } from "@/types/navigation";

export class NavigationService {
  private static instance: NavigationService;
  private activeRoute: ActiveRoute | null = null;
  private routeCache = new Map<string, EnhancedDirectionsResult>();
  private eventListeners: Array<(event: any) => void> = [];

  static getInstance(): NavigationService {
    if (!NavigationService.instance) {
      NavigationService.instance = new NavigationService();
    }
    return NavigationService.instance;
  }

  // Enhanced directions with detailed step information
  async getEnhancedDirections(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    mode: 'walking' | 'driving' | 'transit' | 'bicycling',
    language = 'es'
  ): Promise<EnhancedDirectionsResult | null> {
    const cacheKey = `${origin.lat},${origin.lng}-${destination.lat},${destination.lng}-${mode}`;
    
    // Check cache first
    if (this.routeCache.has(cacheKey)) {
      return this.routeCache.get(cacheKey)!;
    }

    try {
      console.log("🗺️ Getting enhanced directions:", { origin, destination, mode });

      const { data, error } = await supabase.functions.invoke('google-directions-enhanced', {
        body: { origin, destination, mode, language }
      });

      if (error) {
        console.error("Supabase function error:", error);
        throw new Error(error.message || "Failed to get enhanced directions");
      }

      if (data.error) {
        console.error("Google Directions API error:", data.error);
        throw new Error(data.error);
      }

      // Cache the result
      this.routeCache.set(cacheKey, data);
      return data;

    } catch (error) {
      console.error("Error getting enhanced directions:", error);
      return null;
    }
  }

  // Create navigation legs for multi-waypoint route
  async createNavigationRoute(
    places: Array<{ lat: number; lng: number; name: string; place_id?: string }>,
    mode: 'walking' | 'driving' | 'transit' | 'bicycling',
    trip_id: string
  ): Promise<ActiveRoute | null> {
    try {
      const legs: NavigationLeg[] = [];
      let totalDistance = 0;
      let totalDuration = 0;

      // Create legs between consecutive places
      for (let i = 0; i < places.length - 1; i++) {
        const origin = places[i];
        const destination = places[i + 1];

        const result = await this.getEnhancedDirections(
          { lat: origin.lat, lng: origin.lng },
          { lat: destination.lat, lng: destination.lng },
          mode
        );

        if (result) {
          const leg: NavigationLeg = {
            origin: {
              location: { lat: origin.lat, lng: origin.lng },
              name: origin.name,
              place_id: origin.place_id
            },
            destination: {
              location: { lat: destination.lat, lng: destination.lng },
              name: destination.name,
              place_id: destination.place_id
            },
            mode,
            result,
            status: i === 0 ? 'active' : 'pending'
          };

          legs.push(leg);
          
          // Parse distance and duration for totals
          const distanceMatch = result.distance.match(/[\d.,]+/);
          const durationMatch = result.duration.match(/\d+/);
          
          if (distanceMatch) {
            const distance = parseFloat(distanceMatch[0].replace(',', '.'));
            totalDistance += result.distance.includes('km') ? distance : distance / 1000;
          }
          
          if (durationMatch) {
            totalDuration += parseInt(durationMatch[0]);
          }
        }
      }

      const activeRoute: ActiveRoute = {
        id: `route_${Date.now()}`,
        trip_id,
        date: new Date().toISOString().split('T')[0],
        legs,
        current_leg_index: 0,
        status: 'inactive',
        created_at: new Date().toISOString(),
        total_distance: totalDistance >= 1 ? `${totalDistance.toFixed(1)} km` : `${Math.round(totalDistance * 1000)} m`,
        total_duration: totalDuration >= 60 ? `${Math.round(totalDuration / 60)} min` : `${totalDuration} min`,
        progress_percentage: 0
      };

      this.activeRoute = activeRoute;
      this.emitEvent({ type: 'route_created', route: activeRoute });
      
      return activeRoute;

    } catch (error) {
      console.error("Error creating navigation route:", error);
      return null;
    }
  }

  // Start navigation for active route
  startNavigation(): boolean {
    if (!this.activeRoute || this.activeRoute.legs.length === 0) {
      return false;
    }

    this.activeRoute.status = 'active';
    this.activeRoute.started_at = new Date().toISOString();
    this.activeRoute.legs[0].status = 'active';

    this.emitEvent({ 
      type: 'navigation_started', 
      route: this.activeRoute,
      current_leg: this.activeRoute.legs[0]
    });

    console.log("🧭 Navigation started:", this.activeRoute);
    return true;
  }

  // Complete current leg and advance to next
  completeCurrentLeg(): boolean {
    if (!this.activeRoute) return false;

    const currentLeg = this.activeRoute.legs[this.activeRoute.current_leg_index];
    if (!currentLeg) return false;

    // Mark current leg as completed
    currentLeg.status = 'completed';
    currentLeg.actual_arrival_time = new Date().toISOString();

    // Advance to next leg
    this.activeRoute.current_leg_index++;
    
    if (this.activeRoute.current_leg_index < this.activeRoute.legs.length) {
      // Start next leg
      const nextLeg = this.activeRoute.legs[this.activeRoute.current_leg_index];
      nextLeg.status = 'active';
      nextLeg.actual_start_time = new Date().toISOString();

      this.emitEvent({
        type: 'leg_completed',
        completed_leg: currentLeg,
        next_leg: nextLeg,
        route: this.activeRoute
      });

      console.log("✅ Leg completed, advancing to next:", nextLeg.destination.name);
    } else {
      // Route completed
      this.activeRoute.status = 'completed';
      this.activeRoute.completed_at = new Date().toISOString();
      this.activeRoute.progress_percentage = 100;

      this.emitEvent({
        type: 'route_completed',
        route: this.activeRoute
      });

      console.log("🎯 Route completed!");
    }

    return true;
  }

  // Get current route status
  getActiveRoute(): ActiveRoute | null {
    return this.activeRoute;
  }

  getCurrentLeg(): NavigationLeg | null {
    if (!this.activeRoute) return null;
    return this.activeRoute.legs[this.activeRoute.current_leg_index] || null;
  }

  // Calculate route progress
  calculateRouteProgress(
    currentLocation: { lat: number; lng: number },
    currentStepIndex: number = 0
  ): RouteProgress | null {
    const currentLeg = this.getCurrentLeg();
    if (!currentLeg) return null;

    // Calculate distance to destination
    const destination = currentLeg.destination.location;
    const distanceToDestination = this.calculateDistance(
      currentLocation.lat,
      currentLocation.lng,
      destination.lat,
      destination.lng
    );

    // Basic route progress (can be enhanced with polyline snapping)
    const progress: RouteProgress = {
      current_leg: currentLeg,
      current_step_index: currentStepIndex,
      distance_to_next_step: 0, // Would need step-level calculations
      distance_to_destination: distanceToDestination,
      estimated_time_to_destination: distanceToDestination / 1.4, // Assume 1.4 m/s walking speed
      is_on_route: distanceToDestination < 1000, // Basic check - can be enhanced
      last_known_location: currentLocation
    };

    return progress;
  }

  // Parse step instructions based on mode
  parseStepInstruction(step: any, mode: string): NavigationStep {
    if (mode === 'transit' && step.transit_details) {
      return {
        type: 'transit',
        instruction: step.html_instructions?.replace(/<[^>]*>/g, '') || '',
        distance: step.distance?.text || '',
        duration: step.duration?.text || '',
        transit_details: {
          departure_stop: step.transit_details.departure_stop,
          arrival_stop: step.transit_details.arrival_stop,
          line: step.transit_details.line,
          departure_time: step.transit_details.departure_time,
          arrival_time: step.transit_details.arrival_time,
          waiting_duration: step.transit_details.waiting_duration,
          headsign: step.transit_details.headsign,
          num_stops: step.transit_details.num_stops
        }
      };
    } else {
      return {
        type: mode as 'walking' | 'driving',
        instruction: step.html_instructions?.replace(/<[^>]*>/g, '') || '',
        distance: step.distance?.text || '',
        duration: step.duration?.text || '',
        maneuver: step.maneuver,
        street_name: step.street_name,
        start_location: step.start_location,
        end_location: step.end_location,
        polyline: step.polyline
      };
    }
  }

  // Utility function for distance calculation
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  // Event system
  addEventListener(callback: (event: any) => void): void {
    this.eventListeners.push(callback);
  }

  removeEventListener(callback: (event: any) => void): void {
    const index = this.eventListeners.indexOf(callback);
    if (index > -1) {
      this.eventListeners.splice(index, 1);
    }
  }

  private emitEvent(event: any): void {
    this.eventListeners.forEach(callback => callback(event));
  }

  // Clear cache and reset
  clearCache(): void {
    this.routeCache.clear();
  }

  reset(): void {
    this.activeRoute = null;
    this.clearCache();
  }
}

export const navigationService = NavigationService.getInstance();