import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ProfileData } from "@/types/profile";
import { logSecurityEvent, isValidUser } from "@/utils/securityUtils";

export const useProfileData = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = async () => {
    if (!user || !isValidUser(user.id)) {
      logSecurityEvent("Invalid user attempting profile access", { userId: user?.id });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log("Fetching profile for user:", user.id);

      // Secure profile fetch with explicit user validation
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        logSecurityEvent("Profile fetch error", { error: error.message, userId: user.id });
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Profile data fetched:", data);

      if (data) {
        // Validate that returned profile belongs to authenticated user
        if (data.id !== user.id) {
          logSecurityEvent("Profile ID mismatch", { 
            expectedId: user.id, 
            receivedId: data.id 
          });
          throw new Error("Security violation: Profile ID mismatch");
        }
        
        console.log("Profile found:", data);
        setProfile(data as ProfileData);
      } else {
        // Profile should be created automatically by trigger, but if not found, wait briefly and retry
        console.log(
          "No profile found, user might be newly created. Retrying in 1 second..."
        );
        setTimeout(() => {
          fetchProfile();
        }, 1000);
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch profile");
      logSecurityEvent("Profile fetch failed", { error: err, userId: user.id });
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
