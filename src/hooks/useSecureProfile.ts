import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ProfileData } from "@/types/profile";

export const useSecureProfile = () => {
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
      console.log("Fetching secure profile for user:", user.id);

      // Only fetch the user's own profile with explicit user ID check
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      console.log("Secure profile data fetched:", data);
      setProfile(data as ProfileData);
    } catch (err) {
      console.error("Error fetching secure profile:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<ProfileData>) => {
    if (!user) {
      throw new Error("User not authenticated");
    }

    try {
      // Ensure updates only contain the user's own ID
      const secureUpdates = {
        ...updates,
        id: user.id, // Force the ID to be the authenticated user's ID
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from("profiles")
        .update(secureUpdates)
        .eq("id", user.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating profile:", error);
        throw error;
      }

      setProfile(data as ProfileData);
      return data;
    } catch (err) {
      console.error("Error updating secure profile:", err);
      throw err;
    }
  };

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

  useEffect(() => {
    fetchProfile();
  }, [user]);

  return {
    profile,
    loading,
    error,
    getInitials,
    user,
    updateProfile,
    refreshProfile: fetchProfile,
  };
};