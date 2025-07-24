import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Country {
  id: string;
  iso_code: string;
  name: string;
  phone_code: string;
  region: string | null;
  subregion: string | null;
  flag_url: string | null;
}

export const useCountries = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCountries = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("countries")
        .select("*")
        .order("name");

      if (fetchError) {
        throw fetchError;
      }

      setCountries(data || []);
    } catch (err) {
      console.error("Error fetching countries:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch countries"
      );
    } finally {
      setLoading(false);
    }
  };

  const syncCountries = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        "https://suhttfxcurgurshlkcpz.supabase.co/functions/v1/countries-sync",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN1aHR0ZnhjdXJndXJzaGxrY3B6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwMjc4MTAsImV4cCI6MjA2NTYwMzgxMH0.2DLJSoUaSQel60qSaql3x9vRpO7LVXg3mu1qWdXo39g`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Sync failed: ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || "Sync failed");
      }

      // Refresh the countries list
      await fetchCountries();

      return result;
    } catch (err) {
      console.error("Error syncing countries:", err);
      setError(err instanceof Error ? err.message : "Failed to sync countries");
      throw err;
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
    syncCountries,
  };
};
