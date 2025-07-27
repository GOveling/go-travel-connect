import { useState, useEffect } from "react";
import { apiService } from "@/services/apiService";

export interface Country {
  country_code: string;
  country_name: string;
  phone_code: string;
}

export const useCountries = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiService.getCountries();
      
      if (response.success && response.data) {
        // Sort countries by name
        const sortedCountries = response.data.sort((a: Country, b: Country) => 
          a.country_name.localeCompare(b.country_name)
        );
        setCountries(sortedCountries);
      } else {
        throw new Error(response.message || "Failed to fetch countries");
      }
    } catch (err) {
      console.error("Error fetching countries:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch countries"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCountries();
  }, []);

  return {
    countries,
    loading,
    error,
    refetch: fetchCountries,
  };
};
