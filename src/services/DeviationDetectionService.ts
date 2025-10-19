// Deviation Detection Service - Smart route deviation detection and recalculation

import { navigationService } from './NavigationService';

interface LocationPoint {
  lat: number;
  lng: number;
  timestamp: number;
  accuracy?: number;
}

interface DeviationThresholds {
  walking: number;    // 50m
  driving: number;    // 100m
  transit: number;    // 200m
  bicycling: number;  // 75m
}

interface DeviationResult {
  isOffRoute: boolean;
  deviationDistance: number;
  suggestRecalculation: boolean;
  snapToRouteLocation?: { lat: number; lng: number };
  reason?: string;
}

export class DeviationDetectionService {
  private static instance: DeviationDetectionService;
  private locationBuffer: LocationPoint[] = [];
  private lastSnapLocation: LocationPoint | null = null;
  private consecutiveDeviations = 0;
  private deviationStartTime: number | null = null;

  // Thresholds for different transport modes
  private readonly thresholds: DeviationThresholds = {
    walking: 50,     // 50m deviation for walking
    driving: 100,    // 100m deviation for driving  
    transit: 200,    // 200m deviation for transit (more lenient)
    bicycling: 75    // 75m deviation for cycling
  };

  // Time thresholds (milliseconds)
  private readonly DEVIATION_TIME_THRESHOLD = 30000; // 30 seconds
  private readonly BUFFER_SIZE = 10;
  private readonly MIN_ACCURACY = 50; // Only use GPS readings with <50m accuracy

  static getInstance(): DeviationDetectionService {
    if (!DeviationDetectionService.instance) {
      DeviationDetectionService.instance = new DeviationDetectionService();
    }
    return DeviationDetectionService.instance;
  }

  // Add location point to buffer for smoothing
  addLocationPoint(location: LocationPoint): void {
    // Filter out poor accuracy readings
    if (location.accuracy && location.accuracy > this.MIN_ACCURACY) {
      console.log(`🚫 Ignoring GPS reading with poor accuracy: ${location.accuracy}m`);
      return;
    }

    this.locationBuffer.push(location);
    
    // Keep buffer size manageable
    if (this.locationBuffer.length > this.BUFFER_SIZE) {
      this.locationBuffer.shift();
    }
  }

  // Get smoothed location from buffer
  private getSmoothedLocation(): LocationPoint | null {
    if (this.locationBuffer.length === 0) return null;
    
    // Use weighted average with more recent points having higher weight
    let totalWeight = 0;
    let weightedLat = 0;
    let weightedLng = 0;
    let latestTimestamp = 0;

    this.locationBuffer.forEach((point, index) => {
      const weight = index + 1; // More recent = higher weight
      totalWeight += weight;
      weightedLat += point.lat * weight;
      weightedLng += point.lng * weight;
      latestTimestamp = Math.max(latestTimestamp, point.timestamp);
    });

    return {
      lat: weightedLat / totalWeight,
      lng: weightedLng / totalWeight,
      timestamp: latestTimestamp
    };
  }

  // Check for route deviation
  checkDeviation(
    currentLocation: { lat: number; lng: number },
    routeCoordinates: Array<{ lat: number; lng: number }>,
    transportMode: keyof DeviationThresholds
  ): DeviationResult {
    
    const locationPoint: LocationPoint = {
      ...currentLocation,
      timestamp: Date.now()
    };

    this.addLocationPoint(locationPoint);
    const smoothedLocation = this.getSmoothedLocation();
    
    if (!smoothedLocation) {
      return {
        isOffRoute: false,
        deviationDistance: 0,
        suggestRecalculation: false
      };
    }

    // Find closest point on route
    const { closestPoint, distance } = this.findClosestPointOnRoute(
      smoothedLocation,
      routeCoordinates
    );

    const threshold = this.thresholds[transportMode];
    const isOffRoute = distance > threshold;

    // Track consecutive deviations
    if (isOffRoute) {
      this.consecutiveDeviations++;
      if (!this.deviationStartTime) {
        this.deviationStartTime = Date.now();
      }
    } else {
      this.consecutiveDeviations = 0;
      this.deviationStartTime = null;
    }

    // Determine if recalculation should be suggested
    const suggestRecalculation = this.shouldSuggestRecalculation(
      distance,
      transportMode,
      this.consecutiveDeviations
    );

    // Snap to route if deviation is minor (within 2x threshold)
    const snapToRouteLocation = distance <= threshold * 2 ? closestPoint : undefined;

    if (isOffRoute) {
      console.log(`🛣️ Route deviation detected:`, {
        mode: transportMode,
        distance: `${distance.toFixed(0)}m`,
        threshold: `${threshold}m`,
        consecutive: this.consecutiveDeviations,
        suggest_recalc: suggestRecalculation
      });
    }

    return {
      isOffRoute,
      deviationDistance: distance,
      suggestRecalculation,
      snapToRouteLocation,
      reason: isOffRoute ? this.getDeviationReason(distance, threshold, transportMode) : undefined
    };
  }

  // Find closest point on route polyline
  private findClosestPointOnRoute(
    location: LocationPoint,
    routeCoordinates: Array<{ lat: number; lng: number }>
  ): { closestPoint: { lat: number; lng: number }; distance: number } {
    
    let minDistance = Infinity;
    let closestPoint = routeCoordinates[0];

    for (let i = 0; i < routeCoordinates.length - 1; i++) {
      const segmentStart = routeCoordinates[i];
      const segmentEnd = routeCoordinates[i + 1];
      
      // Find closest point on this segment
      const closestOnSegment = this.closestPointOnSegment(
        location,
        segmentStart,
        segmentEnd
      );
      
      const distance = this.calculateDistance(
        location.lat,
        location.lng,
        closestOnSegment.lat,
        closestOnSegment.lng
      );

      if (distance < minDistance) {
        minDistance = distance;
        closestPoint = closestOnSegment;
      }
    }

    return { closestPoint, distance: minDistance };
  }

  // Find closest point on a line segment
  private closestPointOnSegment(
    point: { lat: number; lng: number },
    segmentStart: { lat: number; lng: number },
    segmentEnd: { lat: number; lng: number }
  ): { lat: number; lng: number } {
    
    const A = point.lat - segmentStart.lat;
    const B = point.lng - segmentStart.lng;
    const C = segmentEnd.lat - segmentStart.lat;
    const D = segmentEnd.lng - segmentStart.lng;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    
    if (lenSq === 0) {
      // Segment is a point
      return segmentStart;
    }

    let param = dot / lenSq;
    
    // Clamp to segment bounds
    param = Math.max(0, Math.min(1, param));

    return {
      lat: segmentStart.lat + param * C,
      lng: segmentStart.lng + param * D
    };
  }

  // Determine if recalculation should be suggested
  private shouldSuggestRecalculation(
    deviationDistance: number,
    transportMode: keyof DeviationThresholds,
    consecutiveCount: number
  ): boolean {
    
    const threshold = this.thresholds[transportMode];
    
    // Suggest recalculation if:
    // 1. Deviation is significant (>3x threshold)
    // 2. OR sustained deviation for time threshold
    // 3. OR many consecutive deviations

    const significantDeviation = deviationDistance > threshold * 3;
    const sustainedDeviation = this.deviationStartTime && 
      (Date.now() - this.deviationStartTime) > this.DEVIATION_TIME_THRESHOLD;
    const manyConsecutiveDeviations = consecutiveCount >= 5;

    return significantDeviation || sustainedDeviation || manyConsecutiveDeviations;
  }

  // Get human-readable deviation reason
  private getDeviationReason(
    distance: number,
    threshold: number,
    mode: keyof DeviationThresholds
  ): string {
    
    if (distance > threshold * 3) {
      return `Te has alejado significativamente de la ruta (${distance.toFixed(0)}m)`;
    } else if (distance > threshold * 2) {
      return `Te has desviado de la ruta recomendada (${distance.toFixed(0)}m)`;
    } else {
      return `Ligera desviación de la ruta (${distance.toFixed(0)}m)`;
    }
  }

  // Calculate distance between two points (Haversine formula)
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

  // Suggest recalculation from current location
  async suggestRecalculation(
    currentLocation: { lat: number; lng: number },
    remainingDestinations: Array<{ lat: number; lng: number; name: string }>,
    transportMode: 'walking' | 'driving' | 'transit' | 'bicycling'
  ): Promise<boolean> {
    
    if (remainingDestinations.length === 0) return false;

    try {
      console.log("🔄 Suggesting route recalculation from current location");
      
      // Get directions to next destination
      const nextDestination = remainingDestinations[0];
      const newDirections = await navigationService.getEnhancedDirections(
        currentLocation,
        nextDestination,
        transportMode
      );

      if (newDirections) {
        console.log("✅ New route calculated successfully");
        // The NavigationService would handle updating the active route
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("❌ Error calculating new route:", error);
      return false;
    }
  }

  // Reset deviation tracking
  reset(): void {
    this.locationBuffer = [];
    this.lastSnapLocation = null;
    this.consecutiveDeviations = 0;
    this.deviationStartTime = null;
  }

  // Get current deviation stats
  getDeviationStats() {
    return {
      bufferSize: this.locationBuffer.length,
      consecutiveDeviations: this.consecutiveDeviations,
      deviationDuration: this.deviationStartTime ? Date.now() - this.deviationStartTime : 0
    };
  }
}

export const deviationDetectionService = DeviationDetectionService.getInstance();
