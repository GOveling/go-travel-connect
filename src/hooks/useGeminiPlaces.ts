import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface GeminiPlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  types: string[];
  confidence_score: number;
  full_address: string;
  phone?: string;
  place_description?: string;
  coordinates: { lat: number; lng: number };
  geocoded: boolean;
}

export interface GeminiPlacesResponse {
  predictions: GeminiPlacePrediction[];
  status: string;
}

export const useGeminiPlaces = () => {
  const [predictions, setPredictions] = useState<GeminiPlacePrediction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchPlaces = useCallback(
    async (input: string, selectedCategories: string[] = []) => {
      if (!input.trim()) {
        setPredictions([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log("Searching places with Gemini for:", input);

        const { data, error: functionError } = await supabase.functions.invoke(
          "gemini-places",
          {
            body: {
              input: input.trim(),
              selectedCategories,
              sessionToken: crypto.randomUUID(),
            },
          }
        );

        if (functionError) {
          console.error("Supabase function error:", functionError);
          throw new Error(functionError.message || "Failed to search places");
        }

        if (data.error) {
          console.error("Gemini Places API error:", data.error);
          throw new Error(data.error);
        }

        console.log("Gemini places search results:", data);
        setPredictions(data.predictions || []);
      } catch (err) {
        console.error("Error searching places:", err);
        setError(
          err instanceof Error ? err.message : "Failed to search places"
        );
        setPredictions([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

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
