// Encrypted location data management with unified encryption
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  encryptLocationData,
  decryptLocationData,
  type EncryptedDataContainer
} from "@/utils/unifiedEncryption";
import { logSecurityEvent, isValidUser } from "@/utils/securityUtils";

export interface EncryptedLocationData {
  id: string;
  lat: number;
  lng: number;
  name: string;
  category?: string;
  address?: string;
  visitedAt?: string;
  tripId?: string;
  userId: string;
  createdAt: string;
}

interface LocationVisit {
  id: string;
  encryptedLocation: EncryptedDataContainer;
  isOffline: boolean;
  lastSync?: string;
}

export const useEncryptedLocation = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [locations, setLocations] = useState<EncryptedLocationData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  // Save encrypted location offline
  const saveLocationOffline = async (locationData: EncryptedLocationData): Promise<void> => {
    if (!user?.id) return;

    try {
      const encryptedContainer = await encryptLocationData(locationData);
      const locationVisit: LocationVisit = {
        id: locationData.id,
        encryptedLocation: encryptedContainer,
        isOffline: true,
        lastSync: new Date().toISOString()
      };

      const existingLocations = JSON.parse(
        localStorage.getItem(`encrypted_locations_${user.id}`) || '[]'
      );
      
      const updatedLocations = [...existingLocations, locationVisit];
      localStorage.setItem(
        `encrypted_locations_${user.id}`,
        JSON.stringify(updatedLocations)
      );

      logSecurityEvent("Location saved offline with encryption", { 
        userId: user.id,
        locationId: locationData.id 
      });
    } catch (error) {
      logSecurityEvent("Failed to save encrypted location offline", { 
        userId: user.id,
        error: error.message 
      });
      throw error;
    }
  };

  // Load encrypted locations from offline storage
  const loadLocationsOffline = async (): Promise<EncryptedLocationData[]> => {
    if (!user?.id) return [];

    try {
      const offlineData = localStorage.getItem(`encrypted_locations_${user.id}`);
      if (!offlineData) return [];

      const locationVisits: LocationVisit[] = JSON.parse(offlineData);
      const decryptedLocations: EncryptedLocationData[] = [];

      for (const visit of locationVisits) {
        try {
          const decryptedLocation = await decryptLocationData<EncryptedLocationData>(
            visit.encryptedLocation
          );
          decryptedLocations.push(decryptedLocation);
        } catch (decryptError) {
          logSecurityEvent("Failed to decrypt location", { 
            userId: user.id,
            locationId: visit.id,
            error: decryptError.message 
          });
        }
      }

      logSecurityEvent("Locations loaded from encrypted offline storage", { 
        userId: user.id,
        count: decryptedLocations.length 
      });

      return decryptedLocations;
    } catch (error) {
      logSecurityEvent("Failed to load encrypted locations offline", { 
        userId: user.id,
        error: error.message 
      });
      return [];
    }
  };

  // Record a new location visit with encryption
  const recordLocationVisit = async (
    lat: number,
    lng: number,
    name: string,
    options?: {
      category?: string;
      address?: string;
      tripId?: string;
    }
  ): Promise<boolean> => {
    if (!user?.id || !isValidUser(user.id)) {
      throw new Error("Invalid user");
    }

    try {
      setLoading(true);

      const locationData: EncryptedLocationData = {
        id: crypto.randomUUID(),
        lat,
        lng,
        name,
        category: options?.category,
        address: options?.address,
        tripId: options?.tripId,
        userId: user.id,
        visitedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      if (!isOfflineMode && navigator.onLine) {
        // Try to save online first with encryption
        const { error } = await supabase.from('place_visits').insert({
          user_id: user.id,
          saved_place_id: crypto.randomUUID(), // Generate a saved place ID
          place_name: locationData.name,
          location_lat: locationData.lat,
          location_lng: locationData.lng,
          place_category: locationData.category,
          trip_id: locationData.tripId,
          confirmation_distance: 0, // Auto-confirmed for manual entries
          visited_at: locationData.visitedAt
        });

        if (error) {
          throw error;
        }

        logSecurityEvent("Location visit recorded online", { 
          userId: user.id,
          locationId: locationData.id 
        });
      }

      // Always save encrypted copy offline
      await saveLocationOffline(locationData);
      
      // Update local state
      setLocations(prev => [...prev, locationData]);

      toast({
        title: "Ubicación registrada",
        description: `${name} ha sido guardada de forma segura`,
      });

      return true;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al registrar ubicación';
      setError(errorMessage);
      logSecurityEvent("Location visit recording failed", { 
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

  // Load all locations (online or offline)
  const loadLocations = async (): Promise<void> => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      let locationData: EncryptedLocationData[] = [];

      if (isOfflineMode || !navigator.onLine) {
        // Load from encrypted offline storage
        locationData = await loadLocationsOffline();
      } else {
        // Try to load from online first
        try {
          const { data, error } = await supabase
            .from('place_visits')
            .select('*')
            .eq('user_id', user.id)
            .order('visited_at', { ascending: false });

          if (error) throw error;

          locationData = (data || []).map(visit => ({
            id: visit.id,
            lat: visit.location_lat,
            lng: visit.location_lng,
            name: visit.place_name,
            category: visit.place_category,
            tripId: visit.trip_id,
            userId: visit.user_id,
            visitedAt: visit.visited_at,
            createdAt: visit.created_at
          }));

          logSecurityEvent("Locations loaded online", { 
            userId: user.id,
            count: locationData.length 
          });
        } catch (onlineError) {
          // Fallback to offline
          locationData = await loadLocationsOffline();
          if (locationData.length > 0) {
            toast({
              title: "Modo Offline",
              description: "Usando ubicaciones almacenadas localmente",
              variant: "default"
            });
          }
        }
      }

      setLocations(locationData);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar ubicaciones';
      setError(errorMessage);
      logSecurityEvent("Failed to load locations", { 
        userId: user.id,
        error: errorMessage 
      });
    } finally {
      setLoading(false);
    }
  };

  // Sync offline locations when back online
  const syncOfflineLocations = async (): Promise<boolean> => {
    if (!user?.id || !navigator.onLine) return false;

    try {
      const offlineLocations = await loadLocationsOffline();
      let syncCount = 0;

      for (const location of offlineLocations) {
        try {
          const { error } = await supabase.from('place_visits').insert({
            user_id: location.userId,
            saved_place_id: crypto.randomUUID(), // Generate a saved place ID
            place_name: location.name,
            location_lat: location.lat,
            location_lng: location.lng,
            place_category: location.category,
            trip_id: location.tripId,
            confirmation_distance: 0, // Default confirmation distance
            visited_at: location.visitedAt || location.createdAt
          });

          if (!error) {
            syncCount++;
          }
        } catch (syncError) {
          logSecurityEvent("Location sync failed", { 
            userId: user.id,
            locationId: location.id,
            error: syncError.message 
          });
        }
      }

      if (syncCount > 0) {
        // Clear offline data after successful sync
        localStorage.removeItem(`encrypted_locations_${user.id}`);
        
        logSecurityEvent("Offline locations synced", { 
          userId: user.id,
          syncedCount: syncCount 
        });

        toast({
          title: "Sincronización completa",
          description: `${syncCount} ubicaciones sincronizadas`,
        });
      }

      return true;
    } catch (error) {
      logSecurityEvent("Location sync failed", { 
        userId: user.id,
        error: error.message 
      });
      return false;
    }
  };

  // Toggle offline mode
  const toggleOfflineMode = (offline: boolean) => {
    setIsOfflineMode(offline);
    if (offline) {
      toast({
        title: "Modo Offline Activado",
        description: "Ubicaciones con encriptación AES-256 local",
      });
    }
  };

  useEffect(() => {
    loadLocations();
  }, [user, isOfflineMode]);

  // Auto-sync when coming back online
  useEffect(() => {
    const handleOnline = () => {
      if (isOfflineMode) {
        syncOfflineLocations();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [isOfflineMode, user]);

  return {
    locations,
    loading,
    error,
    isOfflineMode,
    recordLocationVisit,
    loadLocations,
    toggleOfflineMode,
    syncOfflineLocations
  };
};