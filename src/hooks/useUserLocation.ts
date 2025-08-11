import { useCallback, useEffect, useRef, useState } from "react";
import { Geolocation, PermissionStatus, Position } from "@capacitor/geolocation";

export type UserLocation = {
  lat: number;
  lng: number;
  accuracy?: number;
};

export function useUserLocation() {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<PermissionStatus | null>(null);
  const watchIdRef = useRef<string | null>(null);

  const toUserLocation = (position: Position): UserLocation => ({
    lat: position.coords.latitude,
    lng: position.coords.longitude,
    accuracy: position.coords.accuracy,
  });

  const checkAndRequestPermissions = useCallback(async () => {
    try {
      const status = await Geolocation.checkPermissions();
      setPermissionStatus(status);
      if (status.location !== "granted" && status.coarseLocation !== "granted") {
        const requested = await Geolocation.requestPermissions();
        setPermissionStatus(requested);
        return requested;
      }
      return status;
    } catch (e) {
      // On web, some browsers might not support permissions the same way
      return null;
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    setIsLocating(true);
    setError(null);
    try {
      await checkAndRequestPermissions();
      const pos = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });
      const loc = toUserLocation(pos);
      setLocation(loc);
      return loc;
    } catch (e: any) {
      const msg = e?.message || "No se pudo obtener tu ubicación";
      setError(msg);
      return null;
    } finally {
      setIsLocating(false);
    }
  }, [checkAndRequestPermissions]);

  const startWatching = useCallback(async () => {
    try {
      await checkAndRequestPermissions();
      if (watchIdRef.current) return;
      watchIdRef.current = await Geolocation.watchPosition(
        { enableHighAccuracy: true },
        (pos, err) => {
          if (err) {
            setError(err.message || "Error de ubicación");
            return;
          }
          if (pos) setLocation(toUserLocation(pos));
        }
      );
    } catch (e: any) {
      setError(e?.message || "No se pudo iniciar el seguimiento de ubicación");
    }
  }, [checkAndRequestPermissions]);

  const stopWatching = useCallback(async () => {
    if (watchIdRef.current) {
      await Geolocation.clearWatch({ id: watchIdRef.current });
      watchIdRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (watchIdRef.current) {
        Geolocation.clearWatch({ id: watchIdRef.current }).catch(() => {});
        watchIdRef.current = null;
      }
    };
  }, []);

  return {
    location,
    isLocating,
    error,
    permissionStatus,
    getCurrentLocation,
    startWatching,
    stopWatching,
  } as const;
}
