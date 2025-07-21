
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CityResult {
  name: string;
  full_address: string;
  coordinates: { lat: number; lng: number };
  type: string;
  country_code: string;
}

export const useCitiesByCountry = () => {
  const [cities, setCities] = useState<CityResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchCities = useCallback(async (query: string, countryCode: string) => {
    if (!query.trim() || query.length < 2) {
      setCities([]);
      return;
    }

    if (!countryCode) {
      setError('Selecciona un país primero');
      setCities([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Searching cities for:', query, 'in country:', countryCode);
      
      const { data, error: functionError } = await supabase.functions.invoke('cities-by-country', {
        body: { 
          query: query.trim(),
          countryCode: countryCode
        }
      });

      if (functionError) {
        console.error('Supabase function error:', functionError);
        throw new Error(functionError.message || 'Failed to search cities');
      }

      if (data.error) {
        console.error('Cities API error:', data.error);
        throw new Error(data.error);
      }

      console.log('Cities search results:', data);
      setCities(data.cities || []);

    } catch (err) {
      console.error('Error in cities search:', err);
      setError(err instanceof Error ? err.message : 'Failed to search cities');
      setCities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setCities([]);
    setError(null);
  }, []);

  return {
    cities,
    loading,
    error,
    searchCities,
    clearResults
  };
};
