import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useOwnerProfile = (ownerId: string | null) => {
  const [ownerProfile, setOwnerProfile] = useState<{
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ownerId) {
      setOwnerProfile(null);
      return;
    }

    const fetchOwnerProfile = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, email, avatar_url")
          .eq("id", ownerId)
          .single();

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
  }, [ownerId]);

  return { ownerProfile, loading };
};