import { useEffect, useRef, useState } from "react";
import { useUserLocation } from "./useUserLocation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RealtimeTrackingOptions {
  tripId: string;
  userId: string;
  isEnabled: boolean;
  durationMinutes?: number;
  updateIntervalMs?: number;
}

export function useRealtimeLocationTracking({
  tripId,
  userId,
  isEnabled,
  durationMinutes = 60,
  updateIntervalMs = 60000, // 60 segundos por defecto
}: RealtimeTrackingOptions) {
  const { getCurrentLocation } = useUserLocation();
  const { toast } = useToast();
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const realtimeLocationIdRef = useRef<string | null>(null);

  const updateLocationInDB = async (lat: number, lng: number) => {
    try {
      // Si ya existe una ubicación de tiempo real, actualizarla
      if (realtimeLocationIdRef.current) {
        const { error } = await supabase
          .from("trip_shared_locations")
          .update({
            lat,
            lng,
            updated_at: new Date().toISOString(),
          })
          .eq("id", realtimeLocationIdRef.current);

        if (error) throw error;
      } else {
        // Crear nueva ubicación de tiempo real
        const expiresAt = new Date();
        expiresAt.setMinutes(expiresAt.getMinutes() + durationMinutes);

        const { data, error } = await supabase
          .from("trip_shared_locations")
          .insert({
            trip_id: tripId,
            user_id: userId,
            lat,
            lng,
            expires_at: expiresAt.toISOString(),
            location_type: 'real_time',
          })
          .select()
          .single();

        if (error) throw error;
        realtimeLocationIdRef.current = data.id;
      }

      setLastUpdate(new Date());
      setTrackingError(null);
      
      console.log(`📍 Ubicación actualizada: ${lat}, ${lng} en trip ${tripId}`);
    } catch (error) {
      console.error("❌ Error actualizando ubicación:", error);
      setTrackingError("Error al actualizar ubicación");
    }
  };

  const trackLocation = async () => {
    try {
      console.log("🔄 Obteniendo nueva ubicación GPS...");
      const location = await getCurrentLocation();
      
      if (!location) {
        throw new Error("No se pudo obtener la ubicación GPS");
      }

      await updateLocationInDB(location.lat, location.lng);
    } catch (error) {
      console.error("❌ Error en seguimiento de ubicación:", error);
      setTrackingError(error instanceof Error ? error.message : "Error desconocido");
    }
  };

  const startTracking = async () => {
    if (isTracking) return;

    console.log("🟢 Iniciando seguimiento de ubicación en tiempo real");
    setIsTracking(true);
    setTrackingError(null);

    // Obtener ubicación inicial
    await trackLocation();

    // Configurar intervalo para actualizaciones periódicas
    intervalRef.current = setInterval(trackLocation, updateIntervalMs);

    toast({
      title: "Seguimiento GPS activo",
      description: `Actualizando ubicación cada ${updateIntervalMs / 1000} segundos`,
    });
  };

  const stopTracking = async () => {
    if (!isTracking) return;

    console.log("🔴 Deteniendo seguimiento de ubicación en tiempo real");
    setIsTracking(false);

    // Limpiar intervalo
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Eliminar ubicación de la base de datos
    if (realtimeLocationIdRef.current) {
      try {
        const { error } = await supabase
          .from("trip_shared_locations")
          .delete()
          .eq("id", realtimeLocationIdRef.current);

        if (error) throw error;
        
        realtimeLocationIdRef.current = null;
        console.log("🗑️ Ubicación de tiempo real eliminada de la BD");
      } catch (error) {
        console.error("❌ Error eliminando ubicación:", error);
      }
    }

    setLastUpdate(null);
    setTrackingError(null);

    toast({
      title: "Seguimiento GPS detenido",
      description: "Ya no se está compartiendo tu ubicación en tiempo real",
    });
  };

  // Efecto para manejar el estado de seguimiento
  useEffect(() => {
    if (isEnabled && !isTracking) {
      startTracking();
    } else if (!isEnabled && isTracking) {
      stopTracking();
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isEnabled]);

  // Cleanup al desmontar
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Pause tracking when app goes to background (optimización de batería)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && isTracking) {
        console.log("📱 App en background, pausando seguimiento GPS");
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else if (!document.hidden && isTracking && !intervalRef.current) {
        console.log("📱 App en foreground, reanudando seguimiento GPS");
        intervalRef.current = setInterval(trackLocation, updateIntervalMs);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isTracking, updateIntervalMs]);

  return {
    isTracking,
    lastUpdate,
    trackingError,
    startTracking,
    stopTracking,
  };
}