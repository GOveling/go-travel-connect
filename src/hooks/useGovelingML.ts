import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { 
  govelingMLService, 
  GovelingMLService, 
  GovelingMLError,
  type GovelingMLRequest,
  type GovelingMLResponse,
  type GovelingMLPreferences,
  type GovelingMLUserLocation
} from "../services/govelingML";
import { debugLog } from "../config/govelingML";
import type { Trip } from "@/types";

export interface UseGovelingMLProps {
  onSuccess?: (response: GovelingMLResponse) => void;
  onError?: (error: GovelingMLError) => void;
}

export interface UseGovelingMLReturn {
  // State
  isLoading: boolean;
  isHealthChecking: boolean;
  lastResponse: GovelingMLResponse | null;
  lastError: GovelingMLError | null;
  
  // Actions
  generateItinerary: (
    trip: Trip,
    preferences?: Partial<GovelingMLPreferences>,
    userLocation?: GovelingMLUserLocation
  ) => Promise<GovelingMLResponse | null>;
  checkApiHealth: () => Promise<boolean>;
  clearError: () => void;
  
  // Utilities
  transformToInternalFormat: (response: GovelingMLResponse, trip: Trip) => any;
}

export const useGovelingML = ({ 
  onSuccess, 
  onError 
}: UseGovelingMLProps = {}): UseGovelingMLReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [isHealthChecking, setIsHealthChecking] = useState(false);
  const [lastResponse, setLastResponse] = useState<GovelingMLResponse | null>(null);
  const [lastError, setLastError] = useState<GovelingMLError | null>(null);
  const { toast } = useToast();

  /**
   * Check API health status
   */
  const checkApiHealth = useCallback(async (): Promise<boolean> => {
    setIsHealthChecking(true);
    setLastError(null);
    debugLog("Starting API health check");

    try {
      const healthResponse = await govelingMLService.checkHealth();
      debugLog("API health check successful", healthResponse);
      
      toast({
        title: "API Health Check ✅",
        description: "Goveling ML API is running and ready to generate optimized routes.",
      });
      
      return true;
    } catch (error) {
      const govelingError = error instanceof GovelingMLError 
        ? error 
        : new GovelingMLError(500, `Health check failed: ${error}`);
      
      debugLog("API health check failed", govelingError);
      setLastError(govelingError);
      onError?.(govelingError);
      
      toast({
        title: "API Health Check ❌",
        description: `API is not responding: ${govelingError.message}`,
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsHealthChecking(false);
    }
  }, [onError, toast]);

  /**
   * Generate optimized itinerary
   */
  const generateItinerary = useCallback(async (
    trip: Trip,
    preferences?: Partial<GovelingMLPreferences>
  ): Promise<GovelingMLResponse | null> => {
    // Validation
    if (!trip.savedPlaces || trip.savedPlaces.length === 0) {
      const error = new GovelingMLError(
        400, 
        "No places found in trip. Please add some places to your trip before generating an itinerary."
      );
      setLastError(error);
      onError?.(error);
      
      toast({
        title: "Cannot Generate Itinerary",
        description: error.message,
        variant: "destructive",
      });
      
      return null;
    }

    setIsLoading(true);
    setLastError(null);
    
    try {
      // Transform trip data to Goveling ML format
      const request: GovelingMLRequest = GovelingMLService.transformTripToGovelingML(
        trip, 
        preferences
      );

      debugLog("Goveling ML Request", request);
      
      toast({
        title: "🧠 Generating AI Route",
        description: `Processing ${request.places.length} places with ML optimization...`,
      });

      // Call the API
      const response = await govelingMLService.generateHybridItinerary(request);
      
      debugLog("Goveling ML Response", response);
      
      setLastResponse(response);
      onSuccess?.(response);
      
      toast({
        title: "🎉 AI Route Generated!",
        description: `Optimized ${response.analytics.total_activities} activities across ${response.analytics.total_days} days with ${response.analytics.optimization_efficiency.toFixed(1)}% efficiency.`,
      });
      
      return response;
      
    } catch (error) {
      console.error("Error generating itinerary:", error);
      
      const govelingError = error instanceof GovelingMLError 
        ? error 
        : new GovelingMLError(500, `Itinerary generation failed: ${error}`);
      
      setLastError(govelingError);
      onError?.(govelingError);
      
      // Show different messages based on error type
      if (govelingError.statusCode === 400) {
        toast({
          title: "Invalid Request",
          description: "Please check your trip data and try again.",
          variant: "destructive",
        });
      } else if (govelingError.statusCode >= 500) {
        // Don't show error toast for server errors - let fallback handle it
        console.log("ML API server error - fallback will be used");
      } else {
        // Don't show error toast for other errors - let fallback handle it
        console.log("ML API error - fallback will be used");
      }
      
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [onSuccess, onError, toast]);

  /**
   * Transform Goveling ML response to internal format
   */
  const transformToInternalFormat = useCallback((
    response: GovelingMLResponse, 
    trip: Trip
  ) => {
    return GovelingMLService.transformGovelingMLResponse(response, trip);
  }, []);

  /**
   * Clear last error
   */
  const clearError = useCallback(() => {
    setLastError(null);
  }, []);

  return {
    // State
    isLoading,
    isHealthChecking,
    lastResponse,
    lastError,
    
    // Actions
    generateItinerary,
    checkApiHealth,
    clearError,
    
    // Utilities
    transformToInternalFormat,
  };
};
