import { useState, useCallback } from "react";
import { apiService } from "@/services/apiService";

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

        const response = await apiService.getCitiesByCountry(countryCode);
        console.log("Cities API response:", response);
        
        let cities = [];
        if (response && Array.isArray(response)) {
          // If response is directly an array
          cities = response;
        } else if (response && response.data && Array.isArray(response.data)) {
          // If response has data property
          cities = response.data;
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
