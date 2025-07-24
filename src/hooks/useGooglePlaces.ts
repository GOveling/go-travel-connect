import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  types: string[];
}

export interface GooglePlacesResponse {
  predictions: PlacePrediction[];
  status: string;
}

export const useGooglePlaces = () => {
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchPlaces = useCallback(async (input: string) => {
    if (!input.trim()) {
      setPredictions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("Searching places for:", input);

      const { data, error: functionError } = await supabase.functions.invoke(
        "google-places",
        {
          body: {
            input: input.trim(),
            sessionToken: crypto.randomUUID(), // Generate unique session token
          },
        }
      );

      if (functionError) {
        console.error("Supabase function error:", functionError);
        throw new Error(functionError.message || "Failed to search places");
      }

      if (data.error) {
        console.error("Google Places API error:", data.error);
        throw new Error(data.error);
      }

      console.log("Places search results:", data);
      setPredictions(data.predictions || []);
    } catch (err) {
      console.error("Error searching places:", err);
      setError(err instanceof Error ? err.message : "Failed to search places");
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setPredictions([]);
    setError(null);
  }, []);

  return {
    predictions,
    loading,
    error,
    searchPlaces,
    clearResults,
  };
};
