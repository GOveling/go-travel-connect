import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { ProfileData } from "@/types/profile";
import { logSecurityEvent, isValidUser } from "@/utils/securityUtils";

export interface SecureProfileData {
  id: string;
  email?: string;
  full_name?: string;
  birth_date?: string;
  age?: number;
  mobile_phone?: string;
  address?: string;
  country?: string;
  city_state?: string;
  country_code?: string;
  gender?: string;
  description?: string;
  avatar_url?: string;
  onboarding_completed?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PublicProfileData {
  id: string;
  display_name: string;
  avatar_url?: string;
  country?: string;
  description?: string;
}

export const useSecureProfile = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<SecureProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch secure profile data using the secure function
  const fetchProfile = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    if (!isValidUser(user.id)) {
      setError("Invalid user ID");
      logSecurityEvent("Invalid profile access attempt", { userId: user.id });
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log("Fetching secure profile for user:", user.id);

      // Use the secure RPC function instead of direct table access
      const { data, error: fetchError } = await supabase.rpc(
        'get_profile_secure',
        { p_user_id: user.id }
      );

      if (fetchError) {
        throw fetchError;
      }

      if (data && data.length > 0) {
        console.log("Secure profile data fetched:", data[0]);
        setProfile(data[0] as SecureProfileData);
      } else {
        setProfile(null);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch profile';
      setError(errorMessage);
      logSecurityEvent("Profile fetch error", { userId: user.id, error: errorMessage });
      console.error('Error fetching secure profile:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update profile using secure function
  const updateProfile = async (updates: Partial<SecureProfileData>) => {
    if (!user?.id) {
      throw new Error("User not authenticated");
    }

    if (!isValidUser(user.id)) {
      logSecurityEvent("Invalid profile update attempt", { userId: user.id });
      throw new Error("Invalid user ID");
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: updateError } = await supabase.rpc(
        'update_profile_secure',
        {
          p_user_id: user.id,
          p_email: updates.email || null,
          p_full_name: updates.full_name || null,
          p_birth_date: updates.birth_date || null,
          p_mobile_phone: updates.mobile_phone || null,
          p_address: updates.address || null,
          p_country: updates.country || null,
          p_city_state: updates.city_state || null,
          p_country_code: updates.country_code || null,
          p_gender: updates.gender || null,
          p_description: updates.description || null,
          p_avatar_url: updates.avatar_url || null
        }
      );

      if (updateError) {
        throw updateError;
      }

      // Refresh profile after update
      await fetchProfile();
      
      logSecurityEvent("Profile updated successfully", { userId: user.id });
      return true;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to update profile';
      setError(errorMessage);
      logSecurityEvent("Profile update error", { userId: user.id, error: errorMessage });
      console.error('Error updating secure profile:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Fetch public profile data for other users
  const fetchPublicProfile = async (userId: string): Promise<PublicProfileData | null> => {
    if (!isValidUser(userId)) {
      logSecurityEvent("Invalid public profile access attempt", { userId });
      return null;
    }

    try {
      const { data, error: fetchError } = await supabase.rpc(
        'get_profile_public',
        { p_user_id: userId }
      );

      if (fetchError) {
        throw fetchError;
      }

      return data && data.length > 0 ? data[0] : null;
    } catch (err: any) {
      logSecurityEvent("Public profile fetch error", { userId, error: err.message });
      console.error('Error fetching public profile:', err);
      return null;
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
    fetchPublicProfile,
  };
};
