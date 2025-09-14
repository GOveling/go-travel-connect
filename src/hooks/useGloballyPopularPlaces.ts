import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface GloballyPopularPlace {
  name: string;
  category: string;
  formatted_address: string;
  lat: number;
  lng: number;
  save_count: number;
  country: string;
  city: string;
  description: string;
  image: string;
}

export const useGloballyPopularPlaces = () => {
  const [places, setPlaces] = useState<GloballyPopularPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGloballyPopularPlaces = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: rpcError } = await supabase.rpc('get_globally_popular_places', {
        hours_ago: 1
      });

      if (rpcError) {
        console.error('Error fetching globally popular places:', rpcError);
        setError(rpcError.message);
        return;
      }

      setPlaces(data || []);
    } catch (err) {
      console.error('Error in useGloballyPopularPlaces:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGloballyPopularPlaces();

    // Refresh every 5 minutes to get updated popular places
    const interval = setInterval(fetchGloballyPopularPlaces, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  return {
    places,
    loading,
    error,
    refetch: fetchGloballyPopularPlaces,
  };
};