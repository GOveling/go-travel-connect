import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useCreatorProfile = (
  creatorId: string | null,
  tripId?: string | null
) => {
  const [creatorProfile, setCreatorProfile] = useState<{
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!creatorId || !tripId) {
      setCreatorProfile(null);
      return;
    }

    const fetchCreatorProfile = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .rpc("get_trip_user_profile", {
            p_trip_id: tripId,
            p_user_id: creatorId,
          })
          .maybeSingle();

        if (error) {
          console.error("Error fetching creator profile:", error);
          return;
        }

        setCreatorProfile(data);
      } catch (error) {
        console.error("Error fetching creator profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCreatorProfile();
  }, [creatorId, tripId]);

  return { creatorProfile, loading };
};
