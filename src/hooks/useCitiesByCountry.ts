import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CityResult {
  city: string;
  latitude: number;
  longitude: number;
  population: number;
  country_code: string;
}

export const useCitiesByCountry = () => {
  const [cities, setCities] = useState<CityResult[]>([]);
  const [allCities, setAllCities] = useState<CityResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCitiesForCountry = useCallback(
    async (countryCode: string) => {
      if (!countryCode) {
        setAllCities([]);
        setCities([]);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        console.log("Loading cities for country:", countryCode);

        const { data: response, error: functionError } = await supabase.functions.invoke('cities-by-country', {
          body: { 
            query: "", // Empty query to get all cities for the country
            countryCode: countryCode 
          }
        });

        if (functionError) {
          throw new Error(functionError.message || "Failed to fetch cities");
        }

        console.log("Cities API response:", response);
        
        let cities: CityResult[] = [];
        if (response && Array.isArray(response)) {
          // Map the edge function response format to our expected format
          cities = response.map((city: any) => ({
            city: city.name || city.city,
            latitude: city.coordinates?.lat || city.latitude || 0,
            longitude: city.coordinates?.lng || city.longitude || 0,
            population: city.population || 0,
            country_code: city.country_code || countryCode
          }));
        } else {
          throw new Error("Invalid response format");
        }

        // Sort cities by population (descending) and then by name
        const sortedCities = cities.sort((a: CityResult, b: CityResult) => {
          if (b.population !== a.population) {
            return b.population - a.population;
          }
          return a.city.localeCompare(b.city);
        });
        
        setAllCities(sortedCities);
        setCities(sortedCities);
      } catch (err) {
        console.error("Error loading cities:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load cities"
        );
        setAllCities([]);
        setCities([]);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const filterCities = useCallback(
    (query: string) => {
      if (!query.trim() || query.length < 2) {
        setCities(allCities);
        return;
      }

      const filtered = allCities.filter(city =>
        city.city.toLowerCase().includes(query.toLowerCase())
      );
      setCities(filtered);
    },
    [allCities]
  );

  const clearResults = useCallback(() => {
    setCities([]);
    setAllCities([]);
    setError(null);
  }, []);

  return {
    cities,
    loading,
    error,
    loadCitiesForCountry,
    filterCities,
    clearResults,
  };
};
