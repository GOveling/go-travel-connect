
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface EnhancedPlace {
  id: string;
  name: string;
  address: string;
  coordinates: { lat: number; lng: number };
  rating?: number;
  category: string;
  image?: string;
  description?: string;
  hours?: string;
  phone?: string;
  website?: string;
  priceLevel?: number;
  confidence_score: number;
  geocoded: boolean;
  business_status?: string;
  photos?: string[];
  reviews_count?: number;
  opening_hours?: {
    open_now: boolean;
    weekday_text: string[];
  };
}

export interface EnhancedPlacesResponse {
  predictions: EnhancedPlace[];
  status: string;
  source: string;
}

export const useGooglePlacesEnhanced = () => {
  const [predictions, setPredictions] = useState<EnhancedPlace[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchPlaces = useCallback(async (input: string, selectedCategories: string[] = []) => {
    if (!input.trim()) {
      setPredictions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Enhanced search for:', input, 'with categories:', selectedCategories);
      
      const { data, error: functionError } = await supabase.functions.invoke('google-places-enhanced', {
        body: { 
          input: input.trim(),
          selectedCategories
        }
      });

      if (functionError) {
        console.error('Supabase function error:', functionError);
        throw new Error(functionError.message || 'Failed to search places');
      }

      if (data.error) {
        console.error('Enhanced places API error:', data.error);
        throw new Error(data.error);
      }

      console.log('Enhanced search results:', data);
      console.log(`Source: ${data.source}, Found ${data.predictions?.length || 0} places`);
      setPredictions(data.predictions || []);

    } catch (err) {
      console.error('Error in enhanced places search:', err);
      setError(err instanceof Error ? err.message : 'Failed to search places');
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
    clearResults
  };
};
