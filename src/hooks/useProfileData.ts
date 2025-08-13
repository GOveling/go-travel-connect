import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ProfileData } from "@/types/profile";

export const useProfileData = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching profile for user:", user.id);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Profile data fetched:", data);

      if (data) {
        console.log("Profile found:", data);
        setProfile(data as ProfileData);
      } else {
        // Profile should be created automatically by trigger, but if not found, wait briefly and retry
        console.log("No profile found, user might be newly created. Retrying in 1 second...");
        setTimeout(() => {
          fetchProfile();
        }, 1000);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const getInitials = () => {
    if (profile?.full_name && profile.full_name.trim()) {
      return profile.full_name
        .split(" ")
        .map((name: string) => name[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  const refreshProfile = () => {
    console.log("Refreshing profile data...");
    fetchProfile();
  };

  return {
    profile,
    loading,
    error,
    getInitials,
    user,
    refreshProfile,
  };
};
