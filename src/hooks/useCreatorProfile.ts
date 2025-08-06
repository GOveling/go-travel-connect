import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useCreatorProfile = (creatorId: string | null) => {
  const [creatorProfile, setCreatorProfile] = useState<{
    id: string;
    full_name: string | null;
    email: string | null;
    avatar_url: string | null;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!creatorId) {
      setCreatorProfile(null);
      return;
    }

    const fetchCreatorProfile = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, email, avatar_url")
          .eq("id", creatorId)
          .single();

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
  }, [creatorId]);

  return { creatorProfile, loading };
};