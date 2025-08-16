import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useOwnerProfile = (
  ownerId: string | null,
  tripId?: string | null
) => {
  const [ownerProfile, setOwnerProfile] = useState<{
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ownerId || !tripId) {
      setOwnerProfile(null);
      return;
    }

    const fetchOwnerProfile = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .rpc("get_trip_user_profile", {
            p_trip_id: tripId,
            p_user_id: ownerId,
          })
          .maybeSingle();

        if (error) {
          console.error("Error fetching owner profile:", error);
          return;
        }

        setOwnerProfile(data);
      } catch (error) {
        console.error("Error fetching owner profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOwnerProfile();
  }, [ownerId, tripId]);

  return { ownerProfile, loading };
};
