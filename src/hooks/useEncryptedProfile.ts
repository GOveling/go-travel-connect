// Enhanced secure profile hook with unified encryption
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  encryptProfileData,
  decryptProfileData,
  type EncryptedDataContainer
} from "@/utils/unifiedEncryption";
import { 
  logSecurityEvent, 
  isValidUser, 
  encryptSensitiveField,
  decryptSensitiveField 
} from "@/utils/securityUtils";

export interface EncryptedProfileData {
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

interface OfflineProfile {
  data: EncryptedDataContainer;
  lastSync: string;
}

export const useEncryptedProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<EncryptedProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Check if offline profile exists
  const checkOfflineProfile = (): boolean => {
    try {
      const offlineProfile = localStorage.getItem(`encrypted_profile_${user?.id}`);
      return !!offlineProfile;
    } catch {
      return false;
    }
  };

  // Save encrypted profile offline
  const saveOfflineProfile = async (profileData: EncryptedProfileData): Promise<void> => {
    if (!user?.id) return;

    try {
      const encryptedContainer = await encryptProfileData(profileData);
      const offlineProfile: OfflineProfile = {
        data: encryptedContainer,
        lastSync: new Date().toISOString()
      };

      localStorage.setItem(
        `encrypted_profile_${user.id}`,
        JSON.stringify(offlineProfile)
      );

      logSecurityEvent("Profile saved offline", { 
        userId: user.id,
        encryptedSize: JSON.stringify(encryptedContainer).length 
      });
    } catch (error) {
      logSecurityEvent("Failed to save offline profile", { 
        userId: user.id, 
        error: error.message 
      });
      throw error;
    }
  };

  // Load encrypted profile from offline storage
  const loadOfflineProfile = async (): Promise<EncryptedProfileData | null> => {
    if (!user?.id) return null;

    try {
      const offlineData = localStorage.getItem(`encrypted_profile_${user.id}`);
      if (!offlineData) return null;

      const offlineProfile: OfflineProfile = JSON.parse(offlineData);
      const decryptedProfile = await decryptProfileData<EncryptedProfileData>(
        offlineProfile.data
      );

      logSecurityEvent("Profile loaded from offline storage", { 
        userId: user.id,
        lastSync: offlineProfile.lastSync 
      });

      return decryptedProfile;
    } catch (error) {
      logSecurityEvent("Failed to load offline profile", { 
        userId: user.id, 
        error: error.message 
      });
      
      // Clear corrupted data
      localStorage.removeItem(`encrypted_profile_${user.id}`);
      throw new Error("Failed to decrypt offline profile");
    }
  };

  // Fetch secure profile from Supabase
  const fetchOnlineProfile = async (): Promise<EncryptedProfileData | null> => {
    if (!user?.id || !isValidUser(user.id)) {
      throw new Error("Invalid user");
    }

    const { data, error } = await supabase.rpc('get_profile_secure', {
      p_user_id: user.id
    });

    if (error) {
      logSecurityEvent("Profile fetch failed", { 
        userId: user.id, 
        error: error.message 
      });
      throw error;
    }

    if (!data || data.length === 0) {
      return null;
    }

    const profileData = data[0] as EncryptedProfileData;
    
    // Save to offline storage for future use
    await saveOfflineProfile(profileData);
    
    logSecurityEvent("Profile fetched online", { userId: user.id });
    return profileData;
  };

  // Main fetch function
  const fetchProfile = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let profileData: EncryptedProfileData | null = null;

      if (isOfflineMode || !navigator.onLine) {
        // Try offline first
        profileData = await loadOfflineProfile();
        if (!profileData && navigator.onLine) {
          // Fallback to online if offline fails and we have connection
          profileData = await fetchOnlineProfile();
        }
      } else {
        // Try online first
        try {
          profileData = await fetchOnlineProfile();
        } catch (onlineError) {
          // Fallback to offline if online fails
          profileData = await loadOfflineProfile();
          if (profileData) {
            toast({
              title: "Modo Offline",
              description: "Usando perfil almacenado localmente",
              variant: "default"
            });
          }
        }
      }

      setProfile(profileData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setError(errorMessage);
      logSecurityEvent("Profile fetch error", { 
        userId: user.id, 
        error: errorMessage 
      });
    } finally {
      setLoading(false);
    }
  };

  // Update profile with encryption
  const updateProfile = async (updates: Partial<EncryptedProfileData>): Promise<boolean> => {
    if (!user?.id || !isValidUser(user.id)) {
      throw new Error("Invalid user");
    }

    try {
      setLoading(true);

      // Encrypt sensitive fields before sending to backend
      const encryptedUpdates = { ...updates };
      
      if (updates.mobile_phone) {
        encryptedUpdates.mobile_phone = await encryptSensitiveField(updates.mobile_phone);
      }
      if (updates.address) {
        encryptedUpdates.address = await encryptSensitiveField(updates.address);
      }

      if (!isOfflineMode && navigator.onLine) {
        // Try online update first
        const { error } = await supabase.rpc('update_profile_secure', {
          p_user_id: user.id,
          ...encryptedUpdates
        });

        if (error) {
          throw error;
        }

        logSecurityEvent("Profile updated online", { userId: user.id });
      }

      // Update local profile
      const updatedProfile = { ...profile, ...updates } as EncryptedProfileData;
      setProfile(updatedProfile);
      
      // Save encrypted version offline
      await saveOfflineProfile(updatedProfile);

      toast({
        title: "Perfil actualizado",
        description: "Los cambios se han guardado de forma segura",
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar perfil';
      setError(errorMessage);
      logSecurityEvent("Profile update failed", { 
        userId: user.id, 
        error: errorMessage 
      });
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Switch between online/offline modes
  const toggleOfflineMode = (offline: boolean) => {
    setIsOfflineMode(offline);
    if (offline) {
      toast({
        title: "Modo Offline Activado",
        description: "Usando encriptación AES-256 local",
      });
    }
  };

  // Sync offline changes when back online
  const syncOfflineChanges = async (): Promise<boolean> => {
    if (!profile || !user?.id || !navigator.onLine) return false;

    try {
      const { error } = await supabase.rpc('update_profile_secure', {
        p_user_id: user.id,
        ...profile
      });

      if (error) throw error;

      logSecurityEvent("Offline profile synced", { userId: user.id });
      
      toast({
        title: "Sincronización completa",
        description: "Los cambios offline se han sincronizado",
      });

      return true;
    } catch (error) {
      logSecurityEvent("Profile sync failed", { 
        userId: user.id, 
        error: error.message 
      });
      return false;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user, isOfflineMode]);

  // Auto-sync when coming back online
  useEffect(() => {
    const handleOnline = () => {
      if (isOfflineMode && checkOfflineProfile()) {
        syncOfflineChanges();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [isOfflineMode, profile]);

  return {
    profile,
    loading,
    error,
    isOfflineMode,
    hasOfflineData: checkOfflineProfile(),
    fetchProfile,
    updateProfile,
    toggleOfflineMode,
    syncOfflineChanges
  };
};