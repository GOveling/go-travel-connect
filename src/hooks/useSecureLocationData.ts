import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { logSecurityEvent, isValidUser } from "@/utils/securityUtils";

export interface LocationVisit {
  id: string;
  place_name: string;
  place_category?: string;
  visited_at: string;
  country?: string;
  region?: string;
  city?: string;
  trip_id: string;
  approximate_location: string;
}

export interface ExactLocationData {
  latitude: number;
  longitude: number;
  confirmation_distance: number;
}

export const useSecureLocationData = () => {
  const { user } = useAuth();
  const [locationVisits, setLocationVisits] = useState<LocationVisit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch location visits using secure function (returns approximate data by default)
  const fetchLocationVisits = async (limit = 50, offset = 0) => {
    if (!user?.id) {
      setLocationVisits([]);
      return;
    }

    if (!isValidUser(user.id)) {
      setError("Invalid user ID");
      logSecurityEvent("Invalid location data access attempt", { userId: user.id });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase.rpc(
        'get_user_location_visits_secure',
        { 
          p_user_id: user.id,
          p_limit: limit,
          p_offset: offset
        }
      );

      if (fetchError) {
        throw fetchError;
      }

      setLocationVisits(data || []);
      
      logSecurityEvent("Location visits accessed", { 
        userId: user.id, 
        count: data?.length || 0,
        type: "approximate_data"
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch location visits';
      setError(errorMessage);
      logSecurityEvent("Location visits fetch error", { 
        userId: user.id, 
        error: errorMessage 
      });
      console.error('Error fetching location visits:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get exact location data for a specific visit (only when absolutely necessary)
  const getExactLocation = async (visitId: string): Promise<ExactLocationData | null> => {
    if (!user?.id || !isValidUser(user.id)) {
      logSecurityEvent("Invalid exact location access attempt", { 
        userId: user.id, 
        visitId 
      });
      return null;
    }

    try {
      const { data, error: fetchError } = await supabase.rpc(
        'get_place_visit_exact_location',
        { 
          p_visit_id: visitId,
          p_user_id: user.id
        }
      );

      if (fetchError) {
        throw fetchError;
      }

      if (data && data.length > 0) {
        logSecurityEvent("Exact location accessed", { 
          userId: user.id, 
          visitId,
          reason: "exact_coordinates_requested"
        });
        return data[0];
      }

      return null;
    } catch (err: any) {
      logSecurityEvent("Exact location access error", { 
        userId: user.id, 
        visitId,
        error: err.message 
      });
      console.error('Error fetching exact location:', err);
      return null;
    }
  };

  // Create a new location visit with automatic privacy protection
  const createLocationVisit = async (visitData: {
    saved_place_id: string;
    trip_id: string;
    latitude: number;
    longitude: number;
    confirmation_distance: number;
    place_name: string;
    place_category?: string;
    country?: string;
    region?: string;
    city?: string;
  }): Promise<string | null> => {
    if (!user?.id || !isValidUser(user.id)) {
      logSecurityEvent("Invalid location visit creation attempt", { userId: user.id });
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: createError } = await supabase.rpc(
        'create_place_visit_secure',
        {
          p_user_id: user.id,
          p_saved_place_id: visitData.saved_place_id,
          p_trip_id: visitData.trip_id,
          p_location_lat: visitData.latitude,
          p_location_lng: visitData.longitude,
          p_confirmation_distance: visitData.confirmation_distance,
          p_place_name: visitData.place_name,
          p_place_category: visitData.place_category || null,
          p_country: visitData.country || null,
          p_region: visitData.region || null,
          p_city: visitData.city || null
        }
      );

      if (createError) {
        throw createError;
      }

      // Refresh the location visits list
      await fetchLocationVisits();
      
      logSecurityEvent("Location visit created securely", { 
        userId: user.id,
        visitId: data,
        place_category: visitData.place_category
      });

      return data;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to create location visit';
      setError(errorMessage);
      logSecurityEvent("Location visit creation error", { 
        userId: user.id, 
        error: errorMessage 
      });
      console.error('Error creating location visit:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Anonymize old location data for privacy compliance
  const anonymizeOldLocationData = async (olderThanDays = 365): Promise<boolean> => {
    if (!user?.id || !isValidUser(user.id)) {
      logSecurityEvent("Invalid location anonymization attempt", { userId: user.id });
      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: anonymizeError } = await supabase.rpc(
        'anonymize_location_history',
        { 
          p_user_id: user.id,
          p_older_than_days: olderThanDays
        }
      );

      if (anonymizeError) {
        throw anonymizeError;
      }

      // Refresh the location visits list after anonymization
      await fetchLocationVisits();
      
      logSecurityEvent("Location data anonymized", { 
        userId: user.id,
        older_than_days: olderThanDays
      });

      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to anonymize location data';
      setError(errorMessage);
      logSecurityEvent("Location anonymization error", { 
        userId: user.id, 
        error: errorMessage 
      });
      console.error('Error anonymizing location data:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get location statistics without exposing exact coordinates
  const getLocationStats = () => {
    const uniqueCountries = new Set(
      locationVisits
        .filter(visit => visit.country)
        .map(visit => visit.country)
    ).size;

    const uniqueCities = new Set(
      locationVisits
        .filter(visit => visit.city)
        .map(visit => visit.city)
    ).size;

    const totalVisits = locationVisits.length;

    const categoryCounts = locationVisits.reduce((acc, visit) => {
      if (visit.place_category) {
        acc[visit.place_category] = (acc[visit.place_category] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      uniqueCountries,
      uniqueCities,
      totalVisits,
      categoryCounts,
      recentVisits: locationVisits.slice(0, 5) // Just the 5 most recent
    };
  };

  // Auto-fetch location visits when user changes
  useEffect(() => {
    if (user?.id) {
      fetchLocationVisits();
    } else {
      setLocationVisits([]);
    }
  }, [user?.id]);

  return {
    locationVisits,
    loading,
    error,
    fetchLocationVisits,
    getExactLocation,
    createLocationVisit,
    anonymizeOldLocationData,
    getLocationStats,
    refreshLocationVisits: () => user?.id && fetchLocationVisits()
  };
};