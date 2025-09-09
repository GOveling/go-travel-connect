import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

export interface VisitedPlace {
  id: string;
  place_name: string;
  visited_at: string;
  trip_name: string;
  place_category: string | null;
  confirmation_distance: number;
}

export interface VisitedCountry {
  country: string;
  visit_count: number;
  first_visit: string;
  last_visit: string;
}

export interface VisitedCity {
  city: string;
  country: string;
  visit_count: number;
  first_visit: string;
  last_visit: string;
}

export interface Achievement {
  achievement_id: string;
  title: string;
  description: string;
  points: number;
  earned_at: string;
  category: string;
  icon: string;
  rarity: string;
}

export const useTravelStatsDetails = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const fetchVisitedPlaces = useCallback(async (): Promise<VisitedPlace[]> => {
    if (!user) return [];
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('place_visits')
        .select(`
          id,
          place_name,
          visited_at,
          place_category,
          confirmation_distance,
          trip_id
        `)
        .eq('user_id', user.id)
        .order('visited_at', { ascending: false });

      if (error) {
        console.error('Supabase error (place_visits):', error);
        throw error;
      }

      const visits = data || [];

      // Fetch trip names in a second query to avoid FK/relationship issues
      const uniqueTripIds = Array.from(new Set(visits.map(v => v.trip_id).filter(Boolean)));
      let tripNameById: Record<string, string> = {};

      if (uniqueTripIds.length > 0) {
        const { data: tripsData, error: tripsError } = await supabase
          .from('trips')
          .select('id, name')
          .in('id', uniqueTripIds as string[]);

        if (tripsError) {
          console.error('Supabase error (trips):', tripsError);
        } else if (tripsData) {
          tripNameById = tripsData.reduce((acc, t) => {
            acc[t.id] = t.name;
            return acc;
          }, {} as Record<string, string>);
        }
      }

      return visits.map(visit => ({
        id: visit.id,
        place_name: visit.place_name,
        visited_at: visit.visited_at,
        trip_name: tripNameById[visit.trip_id] || 'Viaje sin nombre',
        place_category: visit.place_category,
        confirmation_distance: Number(visit.confirmation_distance)
      }));
    } catch (error) {
      console.error('Error fetching visited places:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchVisitedCountries = useCallback(async (): Promise<VisitedCountry[]> => {
    if (!user) return [];
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('place_visits')
        .select('country, visited_at')
        .eq('user_id', user.id)
        .not('country', 'is', null)
        .order('visited_at', { ascending: false });

      if (error) throw error;

      // Group by country and calculate stats
      const countryStats = data?.reduce((acc, visit) => {
        const country = visit.country!;
        if (!acc[country]) {
          acc[country] = {
            country,
            visit_count: 0,
            first_visit: visit.visited_at,
            last_visit: visit.visited_at
          };
        }
        acc[country].visit_count++;
        if (visit.visited_at < acc[country].first_visit) {
          acc[country].first_visit = visit.visited_at;
        }
        if (visit.visited_at > acc[country].last_visit) {
          acc[country].last_visit = visit.visited_at;
        }
        return acc;
      }, {} as Record<string, VisitedCountry>);

      return Object.values(countryStats || {}).sort((a, b) => 
        new Date(b.last_visit).getTime() - new Date(a.last_visit).getTime()
      );
    } catch (error) {
      console.error('Error fetching visited countries:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchVisitedCities = useCallback(async (): Promise<VisitedCity[]> => {
    if (!user) return [];
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('place_visits')
        .select('city, country, visited_at')
        .eq('user_id', user.id)
        .not('city', 'is', null)
        .order('visited_at', { ascending: false });

      if (error) throw error;

      // Group by city and calculate stats
      const cityStats = data?.reduce((acc, visit) => {
        const cityKey = `${visit.city}-${visit.country}`;
        if (!acc[cityKey]) {
          acc[cityKey] = {
            city: visit.city!,
            country: visit.country || 'Unknown',
            visit_count: 0,
            first_visit: visit.visited_at,
            last_visit: visit.visited_at
          };
        }
        acc[cityKey].visit_count++;
        if (visit.visited_at < acc[cityKey].first_visit) {
          acc[cityKey].first_visit = visit.visited_at;
        }
        if (visit.visited_at > acc[cityKey].last_visit) {
          acc[cityKey].last_visit = visit.visited_at;
        }
        return acc;
      }, {} as Record<string, VisitedCity>);

      return Object.values(cityStats || {}).sort((a, b) => 
        new Date(b.last_visit).getTime() - new Date(a.last_visit).getTime()
      );
    } catch (error) {
      console.error('Error fetching visited cities:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchAchievements = useCallback(async (): Promise<Achievement[]> => {
    if (!user) return [];
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select(`
          achievement_id,
          earned_at,
          achievements!inner(
            title,
            description,
            points,
            category,
            icon,
            rarity
          )
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) throw error;

      return data?.map(achievement => ({
        achievement_id: achievement.achievement_id,
        title: (achievement.achievements as any)?.title || '',
        description: (achievement.achievements as any)?.description || '',
        points: (achievement.achievements as any)?.points || 0,
        earned_at: achievement.earned_at,
        category: (achievement.achievements as any)?.category || '',
        icon: (achievement.achievements as any)?.icon || '',
        rarity: (achievement.achievements as any)?.rarity || 'common'
      })) || [];
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    } finally {
      setLoading(false);
    }
  }, [user]);

  return {
    loading,
    fetchVisitedPlaces,
    fetchVisitedCountries,
    fetchVisitedCities,
    fetchAchievements
  };
};