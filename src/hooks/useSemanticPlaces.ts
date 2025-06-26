import { useState, useCallback } from "react";
import axios from "axios";

export interface PlacePrediction {
  name: string;
  latitude: string;
  longitude: string;
}

export const useSemanticPlaces = () => {
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [loading, setLoading] = useState(false);

  const searchPlaces = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setPredictions([]);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.get("http://localhost:8000/autocomplete", {
        params: { q: query }
      });
      setPredictions(res.data.semantic_suggestions);
    } catch (error) {
      console.error("Error fetching semantic suggestions", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = () => setPredictions([]);

  return {
    predictions,
    loading,
    searchPlaces,
    clearResults,
  };
};
