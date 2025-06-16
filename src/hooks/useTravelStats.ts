
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { TravelStats } from "@/types/profile";

export const useTravelStats = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<TravelStats>({
    countries_visited: 0,
    cities_explored: 0,
    places_visited: 0,
    achievement_points: 0,
    level: 1
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('user_stats')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) throw error;
        
        if (data) {
          setStats({
            countries_visited: data.countries_visited || 0,
            cities_explored: data.cities_explored || 0,
            places_visited: data.places_visited || 0,
            achievement_points: data.achievement_points || 0,
            level: data.level || 1
          });
        }
      } catch (err) {
        console.error('Error fetching travel stats:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  return {
    stats,
    loading,
    error
  };
};
