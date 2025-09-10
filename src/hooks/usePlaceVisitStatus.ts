import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PlaceVisitInfo {
  visited: boolean;
  visitedAt?: string;
  confirmationDistance?: number;
}

export const usePlaceVisitStatus = (savedPlaceId?: string, userId?: string) => {
  const [visitInfo, setVisitInfo] = useState<PlaceVisitInfo>({ visited: false });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!savedPlaceId || !userId) {
      setVisitInfo({ visited: false });
      return;
    }

    const fetchVisitStatus = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.rpc('get_place_visit_info', {
          p_saved_place_id: savedPlaceId,
          p_user_id: userId
        });

        if (error) {
          console.error("Error fetching visit status:", error);
          setVisitInfo({ visited: false });
          return;
        }

        if (data && data.length > 0) {
          const result = data[0];
          setVisitInfo({
            visited: result.visited || false,
            visitedAt: result.visited_at || undefined,
            confirmationDistance: result.confirmation_distance || undefined
          });
        } else {
          setVisitInfo({ visited: false });
        }
      } catch (error) {
        console.error("Error in fetchVisitStatus:", error);
        setVisitInfo({ visited: false });
      } finally {
        setLoading(false);
      }
    };

    fetchVisitStatus();
  }, [savedPlaceId, userId]);

  // Function to manually check if a place is visited (for quick checks)
  const checkIsVisited = async (placeId: string, uId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc('is_place_visited_by_user', {
        p_saved_place_id: placeId,
        p_user_id: uId
      });

      if (error) {
        console.error("Error checking visit status:", error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error("Error in checkIsVisited:", error);
      return false;
    }
  };

  return {
    visitInfo,
    loading,
    checkIsVisited,
    refreshVisitStatus: () => {
      if (savedPlaceId && userId) {
        const fetchVisitStatus = async () => {
          setLoading(true);
          try {
            const { data, error } = await supabase.rpc('get_place_visit_info', {
              p_saved_place_id: savedPlaceId,
              p_user_id: userId
            });

            if (error) {
              console.error("Error fetching visit status:", error);
              setVisitInfo({ visited: false });
              return;
            }

            if (data && data.length > 0) {
              const result = data[0];
              setVisitInfo({
                visited: result.visited || false,
                visitedAt: result.visited_at || undefined,
                confirmationDistance: result.confirmation_distance || undefined
              });
            } else {
              setVisitInfo({ visited: false });
            }
          } catch (error) {
            console.error("Error in refreshVisitStatus:", error);
            setVisitInfo({ visited: false });
          } finally {
            setLoading(false);
          }
        };

        fetchVisitStatus();
      }
    }
  };
};