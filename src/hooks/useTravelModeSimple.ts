import { Geolocation, Position } from "@capacitor/geolocation";
import { useCallback, useEffect, useRef, useState } from "react";
import { travelNotificationService } from "../services/travelNotificationService";
import { SavedPlace, Trip } from "../types";
import { useSupabaseTrips } from "./useSupabaseTrips";
import { getCapacitorConfig } from "../utils/capacitor";
import { useToast } from "./use-toast";
import { useAuth } from "./useAuth";

interface TravelModeConfig {
  isEnabled: boolean;
  proximityRadius: number; // meters
  baseCheckInterval: number; // base interval in milliseconds
  notificationCooldown: number; // time between notifications for same place
  notificationThresholds: number[]; // distances in meters
}

interface TravelModeStatus {
  hasLocationPermission: boolean;
  hasNotificationPermission: boolean;
  hasActiveTrip: boolean;
  isLocationAvailable: boolean;
  lastError: string | null;
}

interface NearbyPlace extends SavedPlace {
  distance: number;
  tripId: string;
  tripName: string;
  hasNotified: Record<number, boolean>;
}

const DEFAULT_CONFIG: TravelModeConfig = {
  isEnabled: false,
  proximityRadius: 20000, // 20km para asegurar detección (incrementado de 15km)
  baseCheckInterval: 30000, // 30 segundos como base
  notificationCooldown: 300000, // 5 minutos entre notificaciones del mismo lugar
  notificationThresholds: [10000, 5000, 2000, 1000, 500, 100, 50, 10], // Agregamos 10m para notificación de llegada
};

interface PlaceArrivalData {
  id: string;
  name: string;
  distance: number;
  category?: string;
  image?: string;
  tripId: string;
  country?: string;
  city?: string;
  formatted_address?: string;
  rating?: number;
}

// Simplified Travel Mode Hook
export const useTravelModeSimple = ({
  config: userConfig,
  onPlaceArrival,
}: {
  config: TravelModeConfig;
  onPlaceArrival?: (place: PlaceArrivalData) => void;
} = { config: DEFAULT_CONFIG }) => {
  const [config, setConfig] = useState<TravelModeConfig>(userConfig || DEFAULT_CONFIG);
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [nearbyPlaces, setNearbyPlaces] = useState<NearbyPlace[]>([]);
  const [isTracking, setIsTracking] = useState(false);
  const [status, setStatus] = useState<TravelModeStatus>({
    hasLocationPermission: false,
    hasNotificationPermission: false,
    hasActiveTrip: false,
    isLocationAvailable: false,
    lastError: null,
  });
  const { trips, loading } = useSupabaseTrips();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isNative } = getCapacitorConfig();

  // Refs for intervals and tracking
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const intervalIdRef = useRef<number>(0); // Track interval ID to prevent duplicates
  const watchIdRef = useRef<string | null>(null);
  const notifiedPlacesRef = useRef<Set<string>>(new Set());
  const lastPositionRef = useRef<Position | null>(null);
  const isTrackingRef = useRef<boolean>(false);
  const isInitializingRef = useRef<boolean>(false);
  const minDistanceRef = useRef<number>(Infinity); // Track minimum distance for dynamic intervals
  const lastToggleTimeRef = useRef<number>(0); // Prevent rapid toggling

  // Haversine formula to calculate distance between two coordinates
  const calculateDistance = useCallback(
    (lat1: number, lon1: number, lat2: number, lon2: number): number => {
      const R = 6371e3; // Earth's radius in meters
      const φ1 = (lat1 * Math.PI) / 180;
      const φ2 = (lat2 * Math.PI) / 180;
      const Δφ = ((lat2 - lat1) * Math.PI) / 180;
      const Δλ = ((lon2 - lon1) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c;
    },
    []
  );

  // Calculate dynamic check interval based on distance to nearest place
  const getDynamicInterval = useCallback(
    (minDistanceToPlace: number): number => {
      // Intervalos dinámicos basados en distancia:
      if (minDistanceToPlace <= 50) return 2000; // 2 segundos - muy cerca
      if (minDistanceToPlace <= 100) return 3000; // 3 segundos - cerca
      if (minDistanceToPlace <= 500) return 5000; // 5 segundos - proximidad media
      if (minDistanceToPlace <= 1000) return 8000; // 8 segundos - proximidad lejana
      if (minDistanceToPlace <= 2000) return 12000; // 12 segundos - acercándose
      if (minDistanceToPlace <= 5000) return 20000; // 20 segundos - mediana distancia
      if (minDistanceToPlace <= 10000) return 30000; // 30 segundos - lejos
      return config.baseCheckInterval; // 30 segundos - muy lejos
    },
    [config.baseCheckInterval]
  );

  // Check and request location permissions
  const checkLocationPermissions = useCallback(async (): Promise<boolean> => {
    try {
      console.log("🔍 Checking location permissions...");
      
      if (isNative) {
        const permissions = await Geolocation.checkPermissions();
        console.log("📱 Current permissions:", permissions);
        
        if (permissions.location !== 'granted' && permissions.coarseLocation !== 'granted') {
          console.log("🔐 Requesting location permissions...");
          const requested = await Geolocation.requestPermissions();
          console.log("📱 Requested permissions result:", requested);
          
          const hasPermission = requested.location === 'granted' || requested.coarseLocation === 'granted';
          setStatus(prev => ({ ...prev, hasLocationPermission: hasPermission }));
          
          if (!hasPermission) {
            toast({
              title: "Permisos requeridos",
              description: "Travel Mode requiere permisos de ubicación para funcionar.",
              variant: "destructive",
            });
            return false;
          }
        } else {
          setStatus(prev => ({ ...prev, hasLocationPermission: true }));
        }
      } else {
        // Web - permissions are handled differently
        setStatus(prev => ({ ...prev, hasLocationPermission: true }));
      }
      
      return true;
    } catch (error) {
      console.error("❌ Error checking location permissions:", error);
      setStatus(prev => ({ 
        ...prev, 
        hasLocationPermission: false,
        lastError: `Error de permisos: ${error}`
      }));
      toast({
        title: "Error de permisos",
        description: "No se pudieron verificar los permisos de ubicación.",
        variant: "destructive",
      });
      return false;
    }
  }, [isNative, toast]);

  // Check notification permissions
  const checkNotificationPermissions = useCallback(async (): Promise<boolean> => {
    try {
      console.log("🔔 Checking notification permissions...");
      const hasPermission = await travelNotificationService.initialize();
      setStatus(prev => ({ ...prev, hasNotificationPermission: !!hasPermission }));
      return !!hasPermission;
    } catch (error) {
      console.error("❌ Error checking notification permissions:", error);
      setStatus(prev => ({ ...prev, hasNotificationPermission: false }));
      return false;
    }
  }, []);

  // Get current location manually with enhanced error handling
  const getCurrentLocation = useCallback(async (): Promise<Position | null> => {
    try {
      console.log("🔍 Getting current location...");

      if (!isNative) {
        return new Promise<Position | null>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log("📍 Location obtained (Web):", position.coords);
              setStatus(prev => ({ ...prev, isLocationAvailable: true, lastError: null }));
              resolve(position);
            },
            (error) => {
              console.error("❌ Error getting location (Web):", error);
              setStatus(prev => ({ 
                ...prev, 
                isLocationAvailable: false,
                lastError: `Error de ubicación: ${error.message}`
              }));
              resolve(null);
            },
            {
              enableHighAccuracy: false,
              timeout: 15000,
              maximumAge: 15000,
            }
          );
        });
      } else {
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: false,
          timeout: 15000,
        });
        console.log("📍 Location obtained (Capacitor):", position.coords);
        setStatus(prev => ({ ...prev, isLocationAvailable: true, lastError: null }));
        return position;
      }
    } catch (error: any) {
      console.error("❌ Error getting current location:", error);
      const errorMessage = error?.message || "No se pudo obtener la ubicación";
      setStatus(prev => ({ 
        ...prev, 
        isLocationAvailable: false,
        lastError: errorMessage
      }));
      toast({
        title: "Error de ubicación",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    }
  }, [isNative, toast]);

  // Check if there's an active trip today (only for owned trips)
  const getActiveTripToday = useCallback((): Trip | null => {
    if (!trips || !user) return null;

    const today = new Date();
    const todayStr = today.toISOString().split("T")[0]; // YYYY-MM-DD
    
    console.log(`🔍 Checking trips for user: ${user.id}`);
    console.log(`📅 Today: ${todayStr}`);
    
    // Filter trips to only include those owned by the current user
    const userOwnedTrips = trips.filter((trip: Trip) => {
      const isOwner = trip.user_id === user.id;
      console.log(`🎯 Trip "${trip.name}" - Owner: ${trip.user_id}, Current User: ${user.id}, Is Owner: ${isOwner}`);
      return isOwner;
    });
    
    console.log(`👤 Found ${userOwnedTrips.length} trips owned by user out of ${trips.length} total accessible trips`);

    const activeTrip = userOwnedTrips.find((trip: Trip) => {
      if (!trip.startDate || !trip.endDate) return false;

      const startDate = new Date(trip.startDate);
      const endDate = new Date(trip.endDate);
      const startDateStr = startDate.toISOString().split("T")[0];
      const endDateStr = endDate.toISOString().split("T")[0];

      const isActive = todayStr >= startDateStr && todayStr <= endDateStr;
      console.log(`📅 Trip "${trip.name}": ${startDateStr} to ${endDateStr} - Active: ${isActive}`);
      
      return isActive;
    });

    const hasActiveTrip = !!activeTrip;
    setStatus(prev => ({ ...prev, hasActiveTrip }));

    if (activeTrip) {
      console.log(
        `🎯 Active OWNED trip today: ${activeTrip.name} (${activeTrip.startDate} to ${activeTrip.endDate})`
      );
      console.log(`📍 Trip has ${activeTrip.savedPlaces?.length || 0} saved places`);
    } else {
      console.log(`❌ No active OWNED trip today (${todayStr})`);
      if (userOwnedTrips.length === 0) {
        console.log(`⚠️ User has no owned trips - may be viewing collaborations only`);
      }
    }

    return activeTrip || null;
  }, [trips, user]);

  // Get all saved places from active trip only
  const getActiveTripPlaces = useCallback((): NearbyPlace[] => {
    const activeTrip = getActiveTripToday();
    if (!activeTrip) {
      console.log("❌ No active trip found for places");
      return [];
    }

    const allPlaces: NearbyPlace[] = [];

    if (activeTrip.savedPlaces) {
      activeTrip.savedPlaces.forEach((place: SavedPlace) => {
        if (place.lat && place.lng) {
          allPlaces.push({
            ...place,
            distance: 0,
            tripId: activeTrip.id,
            tripName: activeTrip.name,
            hasNotified: {},
          });
          console.log(
            `📍 Added place: ${place.name} at ${place.lat.toFixed(6)}, ${place.lng.toFixed(6)}`
          );
        } else {
          console.log(`⚠️ Skipping place ${place.name} - missing coordinates`);
        }
      });
    } else {
      console.log("⚠️ Active trip has no savedPlaces");
    }

    console.log(
      `🗺️ Found ${allPlaces.length} saved places in active trip: ${activeTrip.name}`
    );
    return allPlaces;
  }, [getActiveTripToday]);

  // Get all saved places from all trips (legacy - for testing)
  const getAllSavedPlaces = useCallback((): NearbyPlace[] => {
    if (!trips) return [];

    const allPlaces: NearbyPlace[] = [];

    trips.forEach((trip: Trip) => {
      if (trip.savedPlaces) {
        trip.savedPlaces.forEach((place: SavedPlace) => {
          if (place.lat && place.lng) {
            allPlaces.push({
              ...place,
              distance: 0,
              tripId: trip.id,
              tripName: trip.name,
              hasNotified: {},
            });
          }
        });
      }
    });

    console.log(`🗺️ Found ${allPlaces.length} saved places total`);
    return allPlaces;
  }, [trips]);

  // Check proximity to saved places
  const checkProximity = useCallback(async () => {
    console.log(
      `🔍 Proximity check - isTracking: ${isTrackingRef.current}, trips: ${trips?.length || 0}, loading: ${loading}`
    );

    if (!isTrackingRef.current || !trips) {
      console.log("❌ Skipping proximity check: not tracking or no trips");
      return;
    }

    // Check if there's an active trip today
    const activeTrip = getActiveTripToday();
    if (!activeTrip) {
      console.log("❌ No active trip today - stopping Travel Mode");
      // Stop tracking directly instead of calling stopTravelMode to avoid circular dependency
      setIsTracking(false);
      isTrackingRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    console.log("🔍 === PROXIMITY CHECK STARTED ===");

    // Get fresh location
    const position = await getCurrentLocation();
    if (!position) {
      console.log("❌ No position available for proximity check");
      return;
    }

    // Check if position actually changed
    const positionChanged =
      !lastPositionRef.current ||
      Math.abs(
        position.coords.latitude - lastPositionRef.current.coords.latitude
      ) > 0.0001 ||
      Math.abs(
        position.coords.longitude - lastPositionRef.current.coords.longitude
      ) > 0.0001;

    if (positionChanged) {
      console.log("📍 Position changed! New location:", position.coords);
      lastPositionRef.current = position;
      setCurrentPosition(position);
    } else {
      console.log("📍 Position unchanged");
    }

    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;
    const allPlaces = getActiveTripPlaces();

    console.log(
      `📍 User location: ${userLat.toFixed(6)}, ${userLng.toFixed(6)}`
    );
    console.log(`📏 Search radius: ${config.proximityRadius}m`);
    console.log(`🔍 Checking ${allPlaces.length} places from active trip`);

    const nearby: NearbyPlace[] = [];
    const placesWithNotifications: { place: any; appropriateThreshold: number; distance: number }[] = [];

    allPlaces.forEach((place) => {
      if (place.lat && place.lng) {
        const distance = calculateDistance(
          userLat,
          userLng,
          place.lat,
          place.lng
        );

        console.log(`📏 ${place.name}: ${distance.toFixed(0)}m away`);
        console.log(
          `   📍 Place coords: ${place.lat.toFixed(6)}, ${place.lng.toFixed(6)}`
        );
        console.log(
          `   📏 Distance check: ${distance.toFixed(0)}m <= ${config.proximityRadius}m = ${distance <= config.proximityRadius}`
        );

        if (distance <= config.proximityRadius) {
          console.log(
            `🎯 NEARBY PLACE: ${place.name} (${distance.toFixed(0)}m)`
          );

          const nearbyPlace: NearbyPlace = {
            ...place,
            distance,
            hasNotified: {},
          };

          // Check if user has already "arrived" at this place (≤10m)
          const hasArrived = distance <= 10;
          const arrivalKey = `${place.id}-10`;
          const hasArrivedBefore = notifiedPlacesRef.current.has(arrivalKey);

          if (hasArrived && hasArrivedBefore) {
            console.log(
              `🏁 User has already arrived at ${place.name} - skipping all notifications`
            );
            nearby.push(nearbyPlace);
            return; // Skip notifications but add to nearby list
          }

          // Find the appropriate threshold to notify (smallest threshold greater than current distance)
          const appropriateThreshold = config.notificationThresholds
            .filter((threshold) => distance <= threshold)
            .sort((a, b) => a - b)[0]; // Get the smallest threshold that applies

          if (!appropriateThreshold) {
            console.log(
              `📏 ${place.name}: Too far (${distance.toFixed(0)}m) for any threshold`
            );
            nearby.push(nearbyPlace);
            return;
          }

          // Check if we should notify for this place
          const notificationKey = `${place.id}-${appropriateThreshold}`;

          console.log(
            `🔍 Processing threshold ${appropriateThreshold}m for ${place.name}:`
          );
          console.log(`   - Distance: ${distance.toFixed(0)}m`);
          console.log(`   - Selected threshold: ${appropriateThreshold}m`);
          console.log(
            `   - Within threshold: ${distance <= appropriateThreshold}`
          );
          console.log(
            `   - Already notified: ${notifiedPlacesRef.current.has(notificationKey)}`
          );

          if (
            distance <= appropriateThreshold &&
            !notifiedPlacesRef.current.has(notificationKey)
          ) {
            // Mark as notified immediately to prevent duplicates
            notifiedPlacesRef.current.add(notificationKey);
            nearbyPlace.hasNotified[appropriateThreshold] = true;

            // Add to places that need notifications
            placesWithNotifications.push({
              place: { ...nearbyPlace, tripId: place.tripId, tripName: place.tripName },
              appropriateThreshold,
              distance
            });

            console.log(`📝 Added to notification queue: ${place.name} at ${appropriateThreshold}m`);
          }

          nearby.push(nearbyPlace);
        }
      }
    });

    // Now handle notifications intelligently
    if (placesWithNotifications.length > 0) {
      console.log(`🔔 Processing ${placesWithNotifications.length} places for notifications`);
      
      if (placesWithNotifications.length === 1) {
        // Single place - send individual notification
        const { place, appropriateThreshold, distance } = placesWithNotifications[0];
        
        console.log(`🔔 SENDING INDIVIDUAL NOTIFICATION: ${place.name} at ${appropriateThreshold}m threshold`);

        if (appropriateThreshold === 10) {
          console.log(`🎯 Sending ARRIVAL notification for ${place.name}`);
          travelNotificationService
            .sendArrivalNotification(place)
            .then((success) => {
              console.log(
                `🎯 Arrival notification ${success ? "SUCCESS" : "FAILED"} for ${place.name}`
              );
              if (!success) {
                notifiedPlacesRef.current.delete(`${place.id}-${appropriateThreshold}`);
              }
            })
            .catch((error) => {
              console.error(`❌ Failed to send arrival notification:`, error);
              notifiedPlacesRef.current.delete(`${place.id}-${appropriateThreshold}`);
            });
        } else {
          console.log(
            `📱 Sending PROXIMITY notification for ${place.name} at ${appropriateThreshold}m`
          );
          travelNotificationService
            .sendProximityNotification(place, distance, appropriateThreshold)
            .then((success) => {
              console.log(
                `✅ Proximity notification ${success ? "SUCCESS" : "FAILED"} for ${place.name} at ${appropriateThreshold}m`
              );
              if (!success) {
                notifiedPlacesRef.current.delete(`${place.id}-${appropriateThreshold}`);
              }
            })
            .catch((error) => {
              console.error(`❌ Failed to send notification:`, error);
              notifiedPlacesRef.current.delete(`${place.id}-${appropriateThreshold}`);
            });
        }
      } else {
        // Multiple places - send group notification
        const activeTrip = getActiveTripToday();
        if (activeTrip) {
          console.log(`🗺️ SENDING GROUP NOTIFICATION: ${placesWithNotifications.length} places near trip "${activeTrip.name}"`);
          
          travelNotificationService
            .sendMultipleNearbyPlacesNotification(placesWithNotifications.length, activeTrip.name)
            .then((success) => {
              console.log(
                `🗺️ Group notification ${success ? "SUCCESS" : "FAILED"} for ${placesWithNotifications.length} places`
              );
              if (!success) {
                // If group notification fails, restore individual notifications
                placesWithNotifications.forEach(({ place, appropriateThreshold }) => {
                  notifiedPlacesRef.current.delete(`${place.id}-${appropriateThreshold}`);
                });
              }
            })
            .catch((error) => {
              console.error(`❌ Failed to send group notification:`, error);
              // Restore individual notifications on error
              placesWithNotifications.forEach(({ place, appropriateThreshold }) => {
                notifiedPlacesRef.current.delete(`${place.id}-${appropriateThreshold}`);
              });
            });
        }
      }

      // Clean up notification tracking after 5 minutes
      placesWithNotifications.forEach(({ place, appropriateThreshold }) => {
        if (appropriateThreshold !== 10) {
          setTimeout(
            () => {
              notifiedPlacesRef.current.delete(`${place.id}-${appropriateThreshold}`);
              console.log(
                `🧹 Cleaned up notification tracking for ${place.name} at ${appropriateThreshold}m`
              );
            },
            5 * 60 * 1000
          );
        } else {
          console.log(
            `🔒 Arrival notification marked as permanent for ${place.name}`
          );
        }
      });
    }

    // Update nearby places
    nearby.sort((a, b) => a.distance - b.distance);
    setNearbyPlaces(nearby);

    // Calculate minimum distance for dynamic intervals
    const minDistance = nearby.length > 0 ? nearby[0].distance : Infinity;
    const previousMinDistance = minDistanceRef.current;
    minDistanceRef.current = minDistance;

      // Schedule next check with dynamic interval if distance changed significantly
    if (
      Math.abs(minDistance - previousMinDistance) > 100 ||
      nearby.length === 0
    ) {
      const nextInterval = getDynamicInterval(minDistance);
      console.log(
        `🔄 Updating check interval: ${nextInterval}ms (closest place: ${minDistance.toFixed(0)}m)`
      );

      // Clear current interval and set new one with interval ID tracking
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Only create new interval if we're still tracking
      if (isTrackingRef.current) {
        const newIntervalId = Date.now();
        intervalIdRef.current = newIntervalId;
        
        intervalRef.current = setInterval(() => {
          // Double-check we're still using the same interval before executing
          if (intervalIdRef.current === newIntervalId && isTrackingRef.current) {
            checkProximity();
          }
        }, nextInterval);
      }
    }

    console.log(
      `🔍 === PROXIMITY CHECK COMPLETED: ${nearby.length} nearby places ===`
    );
  }, [
    trips,
    config,
    getCurrentLocation,
    getActiveTripPlaces,
    getActiveTripToday,
    calculateDistance,
    getDynamicInterval,
    loading,
  ]);

  // Start Travel Mode
  const startTravelMode = useCallback(async () => {
    try {
      console.log("🚗 === STARTING TRAVEL MODE ===");

      // Prevent multiple initializations
      if (isInitializingRef.current || isTrackingRef.current) {
        console.log("⚠️ Travel Mode already starting or active");
        return true;
      }

      isInitializingRef.current = true;

      // Check if there's an active trip today FIRST
      const activeTrip = getActiveTripToday();
      if (!activeTrip) {
        console.log("❌ Cannot start Travel Mode: No active trip today");
        isInitializingRef.current = false;
        throw new Error(
          "No active trip today. Travel Mode can only be used during an active trip."
        );
      }

      console.log(`✅ Active trip found: ${activeTrip.name}`);

      // Clear any existing interval to prevent duplicates
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Clear any previous notification tracking state
      await travelNotificationService.clearNotificationTracking();

      // Clear previous deduplication state
      notifiedPlacesRef.current.clear();

      console.log("🧹 Cleared previous notification state");

      // Initialize notification service
      await travelNotificationService.initialize();

      // Request location permissions
      if (isNative) {
        const locationPermission = await Geolocation.requestPermissions();
        console.log("📱 Location permission:", locationPermission);
        if (locationPermission.location !== "granted") {
          throw new Error("Location permission not granted");
        }
      }

      // Get initial location
      const position = await getCurrentLocation();
      if (!position) {
        throw new Error("Could not get initial location");
      }

      setCurrentPosition(position);
      lastPositionRef.current = position;
      setIsTracking(true);
      isTrackingRef.current = true;

      // Send welcome notification
      console.log("📱 Sending welcome notification...");
      await travelNotificationService.sendCustomWelcomeNotification();

      // Start periodic proximity checks with initial base interval
      const initialInterval = getDynamicInterval(Infinity); // Start with max interval
      console.log(
        `⏰ Starting proximity checks every ${initialInterval}ms (initial)`
      );
      intervalRef.current = setInterval(() => {
        console.log("⏰ === PERIODIC CHECK TRIGGERED ===");
        checkProximity();
      }, initialInterval);

      // Send welcome notification only once
      await travelNotificationService.sendCustomWelcomeNotification();

      // Do initial proximity check
      await checkProximity();

      isInitializingRef.current = false;
      console.log("✅ Travel Mode started successfully");
      return true;
    } catch (error) {
      console.error("❌ Error starting Travel Mode:", error);
      isInitializingRef.current = false;
      return false;
    }
  }, [
    getCurrentLocation,
    checkProximity,
    getActiveTripToday,
    getDynamicInterval,
    isNative,
  ]);

  // Stop Travel Mode
  const stopTravelMode = useCallback(async () => {
    console.log("🛑 === STOPPING TRAVEL MODE ===");

    // Clear initialization flag
    isInitializingRef.current = false;

    // Clear intervals with ID tracking
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    intervalIdRef.current = 0; // Reset interval ID

    if (watchIdRef.current) {
      try {
        if (!isNative) {
          navigator.geolocation.clearWatch(
            watchIdRef.current as unknown as number
          );
        } else {
          await Geolocation.clearWatch({ id: watchIdRef.current });
        }
      } catch (error) {
        console.error("Error clearing watch:", error);
      }
      watchIdRef.current = null;
    }

    setIsTracking(false);
    isTrackingRef.current = false;
    setNearbyPlaces([]);
    notifiedPlacesRef.current.clear();
    lastPositionRef.current = null;

    // Clear persisted state when manually stopped
    localStorage.removeItem('travelModeEnabled');

    console.log("✅ Travel Mode stopped");
  }, [isNative]);

  // Toggle Travel Mode with comprehensive validation and debouncing
  const toggleTravelMode = useCallback(async () => {
    const now = Date.now();
    
    // Debounce rapid toggles (prevent calls within 2 seconds)
    if (now - lastToggleTimeRef.current < 2000) {
      console.log("⚠️ Toggle debounced - too rapid");
      return;
    }
    lastToggleTimeRef.current = now;

    console.log(`🔄 Toggle Travel Mode called - current: ${config.isEnabled}`);

    if (config.isEnabled) {
      console.log("🛑 Stopping Travel Mode...");
      await stopTravelMode();
      setConfig((prev) => ({ ...prev, isEnabled: false }));
    } else {
      console.log("🚀 Starting Travel Mode...");
      
      // Reset error state
      setStatus(prev => ({ ...prev, lastError: null }));
      
      // Check all prerequisites
      const activeTrip = getActiveTripToday();
      if (!activeTrip) {
        toast({
          title: "Viaje requerido",
          description: "Necesitas un viaje activo para usar Travel Mode. Crea uno primero.",
          variant: "destructive",
        });
        setStatus(prev => ({ 
          ...prev, 
          lastError: "No hay viaje activo para hoy"
        }));
        return;
      }

      // Check location permissions
      const hasLocationPermission = await checkLocationPermissions();
      if (!hasLocationPermission) {
        return; // Error already shown by checkLocationPermissions
      }

      // Check notification permissions (optional)
      await checkNotificationPermissions();

      // Try to get initial location
      const position = await getCurrentLocation();
      if (!position) {
        toast({
          title: "Error de ubicación",
          description: "No se pudo obtener tu ubicación actual. Verifica que esté activado el GPS.",
          variant: "destructive",
        });
        return;
      }

      const success = await startTravelMode();
      if (success) {
        setConfig((prev) => ({ ...prev, isEnabled: true }));
      }
    }
  }, [config.isEnabled, startTravelMode, stopTravelMode, getActiveTripToday, checkLocationPermissions, checkNotificationPermissions, getCurrentLocation, toast]);

  // Persist Travel Mode state
  useEffect(() => {
    localStorage.setItem('travelModeEnabled', JSON.stringify(config.isEnabled));
  }, [config.isEnabled]);

  // Restore Travel Mode state on mount with better validation
  useEffect(() => {
    // Travel Mode should be disabled by default unless explicitly enabled by user
    const savedState = localStorage.getItem('travelModeEnabled');
    if (savedState === 'true' && !config.isEnabled && !isInitializingRef.current) {
      console.log("🔄 User had previously enabled Travel Mode, checking conditions...");
      
      // Only restore if we have necessary conditions
      const activeTrip = getActiveTripToday();
      if (activeTrip) {
        setConfig(prev => ({ ...prev, isEnabled: true }));
        // Restart tracking if was previously enabled
        setTimeout(() => {
          if (!isTrackingRef.current && !isInitializingRef.current) {
            startTravelMode();
          }
        }, 1000); // Increased delay to ensure everything is initialized
      } else {
        // Clear invalid saved state
        localStorage.removeItem('travelModeEnabled');
        console.log("🧹 Cleared invalid saved Travel Mode state (no active trip)");
      }
    }
  }, [startTravelMode, config.isEnabled, getActiveTripToday]);

  // Clean up tracking resources only (but don't disable Travel Mode)
  useEffect(() => {
    return () => {
      // Only clear intervals and watches, but don't disable Travel Mode
      // Travel Mode should remain active until user manually disables it
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (watchIdRef.current) {
        try {
          if (!isNative) {
            navigator.geolocation.clearWatch(
              watchIdRef.current as unknown as number
            );
          } else {
            Geolocation.clearWatch({ id: watchIdRef.current });
          }
        } catch (error) {
          console.error("Error clearing watch on unmount:", error);
        }
      }
    };
  }, [isNative]);

  // Update status on trips change
  useEffect(() => {
    getActiveTripToday(); // This will update the hasActiveTrip status
  }, [trips, getActiveTripToday]);

  return {
    // State
    config,
    currentPosition,
    nearbyPlaces,
    isTracking,
    loading,
    status,

    // Actions
    toggleTravelMode,
    startTravelMode,
    stopTravelMode,
    checkProximity: () => checkProximity(),
    checkLocationPermissions,
    checkNotificationPermissions,
    getActiveTripToday,

    // Utils
    calculateDistance,
  };
};