import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

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
}

export const useGoogleDirections = () => {
  const [routes, setRoutes] = useState<Map<string, DirectionsResult>>(new Map());
  const [loading, setLoading] = useState<Set<string>>(new Set());
  const [errors, setErrors] = useState<Map<string, string>>(new Map());

  const getRouteKey = useCallback((origin: { lat: number; lng: number }, destination: { lat: number; lng: number }, mode: string) => {
    return `${origin.lat},${origin.lng}-${destination.lat},${destination.lng}-${mode}`;
  }, []);

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
      console.log("Getting directions for:", request);

      const { data, error: functionError } = await supabase.functions.invoke(
        "google-directions",
        {
          body: request,
        }
      );

      if (functionError) {
        console.error("Supabase function error:", functionError);
        throw new Error(functionError.message || "Failed to get directions");
      }

      if (data.error) {
        console.error("Google Directions API error:", data.error);
        throw new Error(data.error);
      }

      console.log("Directions result:", data);
      
      setRoutes(prev => new Map(prev).set(routeKey, data));
      return data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to get directions";
      console.error("Error getting directions:", err);
      
      setErrors(prev => new Map(prev).set(routeKey, errorMessage));
      return null;
    } finally {
      setLoading(prev => {
        const newLoading = new Set(prev);
        newLoading.delete(routeKey);
        return newLoading;
      });
    }
  }, [routes, loading, getRouteKey]);

  const calculateItineraryRoutes = useCallback(async (
    places: Array<{ lat: number; lng: number; name: string }>,
    mode: 'walking' | 'driving' | 'transit' | 'bicycling' = 'walking'
  ): Promise<RouteSegment[]> => {
    const segments: RouteSegment[] = [];
    
    for (let i = 0; i < places.length - 1; i++) {
      const origin = places[i];
      const destination = places[i + 1];
      
      const result = await getDirections({
        origin: { lat: origin.lat, lng: origin.lng },
        destination: { lat: destination.lat, lng: destination.lng },
        mode,
      });

      if (result) {
        segments.push({
          from: origin.name,
          to: destination.name,
          mode,
          result,
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

  return {
    getDirections,
    calculateItineraryRoutes,
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