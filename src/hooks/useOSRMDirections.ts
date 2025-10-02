import { useState, useCallback } from "react";

export interface DirectionsRequest {
  origin: { lat: number; lng: number };
  destination: { lat: number; lng: number };
  mode: 'walking' | 'driving' | 'transit' | 'bicycling';
  language?: string;
}

export interface DirectionsStep {
  instruction: string;
  distance: string;
  duration: string;
}

export interface DirectionsResult {
  distance: string;
  duration: string;
  steps: DirectionsStep[];
  route_polyline: string;
  coordinates: Array<{ lat: number; lng: number }>;
}

export interface RouteSegment {
  from: string;
  to: string;
  mode: string;
  result: DirectionsResult;
  transferType?: string;
}

// Decode polyline from OSRM
const decodePolyline = (str: string, precision = 5): Array<{ lat: number; lng: number }> => {
  let index = 0;
  let lat = 0;
  let lng = 0;
  const coordinates: Array<{ lat: number; lng: number }> = [];
  const factor = Math.pow(10, precision);

  while (index < str.length) {
    let byte = 0;
    let shift = 0;
    let result = 0;

    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lat += deltaLat;

    shift = 0;
    result = 0;

    do {
      byte = str.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const deltaLng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
    lng += deltaLng;

    coordinates.push({
      lat: lat / factor,
      lng: lng / factor
    });
  }

  return coordinates;
};

export const useOSRMDirections = () => {
  const [routes, setRoutes] = useState<Map<string, DirectionsResult>>(new Map());
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Map<string, string>>(new Map());

  const getRouteKey = useCallback((origin: { lat: number; lng: number }, destination: { lat: number; lng: number }, mode: string) => {
    return `${origin.lat},${origin.lng}-${destination.lat},${destination.lng}-${mode}`;
  }, []);

  const getOSRMProfile = (mode: 'walking' | 'driving' | 'transit' | 'bicycling') => {
    switch (mode) {
      case 'driving': return 'driving';
      case 'bicycling': return 'cycling';
      case 'walking': 
      case 'transit':
      default: return 'foot';
    }
  };

  const getDirections = useCallback(async (request: DirectionsRequest): Promise<DirectionsResult | null> => {
    const routeKey = getRouteKey(request.origin, request.destination, request.mode);
    
    // Return cached result if available
    if (routes.has(routeKey)) {
      return routes.get(routeKey)!;
    }

    // Return null if already loading
    if (loading.has(routeKey)) {
      return null;
    }

    setLoading(prev => new Set(prev).add(routeKey));
    setErrors(prev => {
      const newErrors = new Map(prev);
      newErrors.delete(routeKey);
      return newErrors;
    });

    try {
      const profile = getOSRMProfile(request.mode);
      const coordsString = `${request.origin.lng},${request.origin.lat};${request.destination.lng},${request.destination.lat}`;
      const url = `https://router.project-osrm.org/route/v1/${profile}/${coordsString}?overview=full&geometries=polyline&steps=true`;

      console.log("🗺️ OSRM Request:", {
        routeKey,
        mode: request.mode,
        profile,
        origin: request.origin,
        destination: request.destination,
        url
      });

      const response = await fetch(url);
      
      console.log("📡 OSRM Response Status:", {
        routeKey,
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ OSRM HTTP Error:", {
          routeKey,
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`OSRM API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      
      console.log("📦 OSRM Response Data:", {
        routeKey,
        code: data.code,
        message: data.message,
        routesCount: data.routes?.length || 0,
        fullData: data
      });

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        console.error("❌ OSRM No Route:", {
          routeKey,
          code: data.code,
          message: data.message,
          dataReceived: data
        });
        throw new Error(data.message || 'No route found');
      }

      const route = data.routes[0];
      const routeCoordinates = decodePolyline(route.geometry);

      // Create steps from OSRM legs
      const steps: DirectionsStep[] = [];
      if (route.legs && route.legs[0] && route.legs[0].steps) {
        route.legs[0].steps.forEach((step: any) => {
          steps.push({
            instruction: step.maneuver?.instruction || 'Continue',
            distance: `${(step.distance / 1000).toFixed(1)} km`,
            duration: `${Math.round(step.duration / 60)} min`
          });
        });
      }

      const result: DirectionsResult = {
        distance: `${(route.distance / 1000).toFixed(1)} km`,
        duration: `${Math.round(route.duration / 60)} min`,
        steps,
        route_polyline: route.geometry,
        coordinates: routeCoordinates
      };

      console.log("✅ OSRM Success:", {
        routeKey,
        distance: result.distance,
        duration: result.duration,
        coordinatesCount: result.coordinates.length,
        stepsCount: result.steps.length
      });
      
      setRoutes(prev => new Map(prev).set(routeKey, result));
      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to get directions";
      console.error("❌ OSRM Error - Using Fallback:", {
        routeKey,
        error: errorMessage,
        errorStack: err instanceof Error ? err.stack : undefined,
        willUseStraightLine: true
      });
      
      setErrors(prev => new Map(prev).set(routeKey, errorMessage));
      
      // Fallback: create straight line route
      const straightLineResult: DirectionsResult = {
        distance: "N/A",
        duration: "N/A", 
        steps: [],
        route_polyline: "",
        coordinates: [request.origin, request.destination]
      };
      
      console.warn("⚠️ Using Straight Line Fallback:", {
        routeKey,
        origin: request.origin,
        destination: request.destination,
        coordinates: straightLineResult.coordinates
      });
      
      setRoutes(prev => new Map(prev).set(routeKey, straightLineResult));
      return straightLineResult;
    } finally {
      setLoading(prev => {
        const newLoading = new Set(prev);
        newLoading.delete(routeKey);
        return newLoading;
      });
    }
  }, [routes, loading, getRouteKey]);

  const calculateItineraryRoutes = useCallback(async (
    places: Array<{ lat: number; lng: number; name: string; type?: string; transportMode?: string }>,
    mode: 'walking' | 'driving' | 'transit' | 'bicycling' = 'walking'
  ): Promise<RouteSegment[]> => {
    const segments: RouteSegment[] = [];
    
    for (let i = 0; i < places.length - 1; i++) {
      const origin = places[i];
      const destination = places[i + 1];
      
      // Determine the transport mode for this segment
      let segmentMode = mode;
      if (destination.type === 'transfer' && destination.transportMode) {
        // Map transport modes to OSRM compatible modes
        switch (destination.transportMode) {
          case 'drive':
          case 'car':
            segmentMode = 'driving';
            break;
          case 'walk':
            segmentMode = 'walking';
            break;
          case 'transit':
            segmentMode = 'walking'; // OSRM doesn't have transit, use walking
            break;
          default:
            segmentMode = mode;
        }
      }
      
      const result = await getDirections({
        origin: { lat: origin.lat, lng: origin.lng },
        destination: { lat: destination.lat, lng: destination.lng },
        mode: segmentMode,
      });

      if (result) {
        segments.push({
          from: origin.name,
          to: destination.name,
          mode: segmentMode,
          result,
          transferType: destination.type === 'transfer' ? 'intercity_transfer' : undefined
        });
      }
    }

    return segments;
  }, [getDirections]);

  const isLoading = useCallback((origin: { lat: number; lng: number }, destination: { lat: number; lng: number }, mode: string) => {
    const routeKey = getRouteKey(origin, destination, mode);
    return loading.has(routeKey);
  }, [loading, getRouteKey]);

  const getError = useCallback((origin: { lat: number; lng: number }, destination: { lat: number; lng: number }, mode: string) => {
    const routeKey = getRouteKey(origin, destination, mode);
    return errors.get(routeKey) || null;
  }, [errors, getRouteKey]);

  const clearCache = useCallback(() => {
    setRoutes(new Map());
    setLoading(new Set());
    setErrors(new Map());
  }, []);

  const calculateTransferRoutes = useCallback(async (transfers: Array<{
    from_lat: number;
    from_lon: number;
    to_lat: number;
    to_lon: number;
    mode: string;
    from?: string;
    to?: string;
    distance_km?: number;
    duration_minutes?: number;
    overnight?: boolean;
  }>): Promise<Array<{
    transfer: any;
    route: DirectionsResult | null;
  }>> => {
    const transferRoutes = [];
    
    for (const transfer of transfers) {
      // Skip flights - they don't need road routes
      if (transfer.mode === 'flight') {
        transferRoutes.push({ transfer, route: null });
        continue;
      }

      const request: DirectionsRequest = {
        origin: { lat: transfer.from_lat, lng: transfer.from_lon },
        destination: { lat: transfer.to_lat, lng: transfer.to_lon },
        mode: transfer.mode === 'drive' ? 'driving' : 
              transfer.mode === 'walk' ? 'walking' : 
              transfer.mode === 'bike' ? 'bicycling' : 'driving',
        language: 'es'
      };

      const route = await getDirections(request);
      transferRoutes.push({ transfer, route });
    }

    return transferRoutes;
  }, [getDirections]);

  return {
    getDirections,
    calculateItineraryRoutes,
    calculateTransferRoutes,
    isLoading,
    getError,
    clearCache,
    routes: routes,
    hasRoute: (origin: { lat: number; lng: number }, destination: { lat: number; lng: number }, mode: string) => {
      const routeKey = getRouteKey(origin, destination, mode);
      return routes.has(routeKey);
    }
  };
};