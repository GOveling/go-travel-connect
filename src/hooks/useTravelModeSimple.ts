import { Geolocation, Position } from "@capacitor/geolocation";
import { useCallback, useEffect, useRef, useState } from "react";
import { travelNotificationService } from "../services/travelNotificationService";
import { SavedPlace, Trip } from "../types";
import { useSupabaseTrips } from "./useSupabaseTrips";
import { getCapacitorConfig } from "../utils/capacitor";
import { getEnvironmentConfig } from "../utils/environment";
import { useToast } from "./use-toast";
import { useAuth } from "./useAuth";
import { getAdaptiveProximityThresholds, logAdaptiveRadiusInfo } from "../utils/adaptiveRadius";

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
  notificationThresholds: [5000, 2000, 1000, 500, 100, 50, 10], // Eliminado 10000 (10km)
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
  const { isCapacitor } = getEnvironmentConfig();

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
  
  // GPS stabilization refs
  const locationBufferRef = useRef<Position[]>([]);
  const nearPlacesStateRef = useRef<Map<string, { isNear: boolean, consecutiveCount: number }>>(new Map());
  const lastStablePositionRef = useRef<Position | null>(null);

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

  // GPS stabilization utilities
  const addToLocationBuffer = useCallback((position: Position) => {
    const buffer = locationBufferRef.current;
    buffer.push(position);
    
    // Keep only last 5 readings
    if (buffer.length > 5) {
      buffer.shift();
    }
  }, []);

  const getStablePosition = useCallback((): Position | null => {
    const buffer = locationBufferRef.current;
    if (buffer.length === 0) return null;
    
    // If we only have one reading, use it
    if (buffer.length === 1) return buffer[0];
    
    // Filter out readings with poor accuracy (>30m)
    const goodReadings = buffer.filter(pos => pos.coords.accuracy <= 30);
    const readings = goodReadings.length > 0 ? goodReadings : buffer;
    
    // Calculate average position
    const avgLat = readings.reduce((sum, pos) => sum + pos.coords.latitude, 0) / readings.length;
    const avgLng = readings.reduce((sum, pos) => sum + pos.coords.longitude, 0) / readings.length;
    const avgAccuracy = readings.reduce((sum, pos) => sum + pos.coords.accuracy, 0) / readings.length;
    
    // Create stable position using the most recent reading as template
    const latestReading = readings[readings.length - 1];
    return {
      ...latestReading,
      coords: {
        ...latestReading.coords,
        latitude: avgLat,
        longitude: avgLng,
        accuracy: avgAccuracy,
      }
    };
  }, []);

  const validateNewReading = useCallback((position: Position): boolean => {
    // Check accuracy - reject readings with poor accuracy
    if (position.coords.accuracy > 50) {
      console.log(`⚠️ Rejecting GPS reading with poor accuracy: ${position.coords.accuracy}m`);
      return false;
    }
    
    // Check for large jumps from previous position
    if (lastStablePositionRef.current) {
      const distance = calculateDistance(
        lastStablePositionRef.current.coords.latitude,
        lastStablePositionRef.current.coords.longitude,
        position.coords.latitude,
        position.coords.longitude
      );
      
      // Reject readings that show >100m jump unless accuracy is very good
      if (distance > 100 && position.coords.accuracy > 10) {
        console.log(`⚠️ Rejecting GPS reading with large jump: ${distance.toFixed(0)}m`);
        return false;
      }
    }
    
    return true;
  }, [calculateDistance]);

  // Calculate dynamic check interval based on distance to nearest place and platform
  const getDynamicInterval = useCallback(
    (minDistanceToPlace: number): number => {
      // Platform-specific interval adjustments
      const platformMultiplier = isNative ? 1 : 0.8; // Web needs slightly more frequent checks
      
      // Adaptive intervals - more frequent when close to larger venues
      // Account for adaptive radius by using more frequent checks for larger thresholds
      if (minDistanceToPlace <= 15) return Math.round(3000 * platformMultiplier); // Very close - 3s native, 2.4s web
      if (minDistanceToPlace <= 50) return Math.round(2000 * platformMultiplier); // Close - 2s native, 1.6s web
      if (minDistanceToPlace <= 100) return Math.round(4000 * platformMultiplier); // Medium distance - 4s native, 3.2s web
      if (minDistanceToPlace <= 200) return Math.round(6000 * platformMultiplier); // Medium-far - 6s native, 4.8s web
      if (minDistanceToPlace <= 500) return Math.round(8000 * platformMultiplier); // Far - 8s native, 6.4s web
      if (minDistanceToPlace <= 1000) return Math.round(12000 * platformMultiplier); // Very far - 12s native, 9.6s web
      if (minDistanceToPlace <= 2000) return Math.round(15000 * platformMultiplier); // Distant - 15s native, 12s web
      if (minDistanceToPlace <= 5000) return Math.round(20000 * platformMultiplier); // Very distant - 20s native, 16s web
      if (minDistanceToPlace <= 10000) return Math.round(30000 * platformMultiplier); // Very far - 30s native, 24s web
      return Math.round(config.baseCheckInterval * platformMultiplier); // Base interval adjusted
    },
    [config.baseCheckInterval, isNative]
  );

  // Check and request location permissions - Enhanced for both platforms
  const checkLocationPermissions = useCallback(async (): Promise<boolean> => {
    try {
      console.log(`🔍 Checking location permissions... (Platform: ${isCapacitor ? 'Native' : 'Web'})`);
      
      if (isNative) {
        // Native platform - Use Capacitor
        const permissions = await Geolocation.checkPermissions();
        console.log("📱 Current Capacitor permissions:", permissions);
        
        if (permissions.location !== 'granted' && permissions.coarseLocation !== 'granted') {
          console.log("🔐 Requesting Capacitor location permissions...");
          const requested = await Geolocation.requestPermissions();
          console.log("📱 Requested permissions result:", requested);
          
          const hasPermission = requested.location === 'granted' || requested.coarseLocation === 'granted';
          setStatus(prev => ({ ...prev, hasLocationPermission: hasPermission }));
          
          if (!hasPermission) {
            toast({
              title: "Permisos requeridos",
              description: "Travel Mode requiere permisos de ubicación para funcionar correctamente en dispositivos móviles.",
              variant: "destructive",
            });
            return false;
          }
        } else {
          setStatus(prev => ({ ...prev, hasLocationPermission: true }));
        }
      } else {
        // Web platform - Check browser geolocation API
        if (!navigator.geolocation) {
          console.error("❌ Geolocation not available in this browser");
          setStatus(prev => ({ 
            ...prev, 
            hasLocationPermission: false,
            lastError: "Geolocalización no disponible en este navegador"
          }));
          toast({
            title: "Geolocalización no disponible",
            description: "Su navegador no soporta geolocalización.",
            variant: "destructive",
          });
          return false;
        }

        // Check permissions API if available
        if ('permissions' in navigator) {
          try {
            const result = await navigator.permissions.query({ name: 'geolocation' });
            console.log("🌐 Browser geolocation permission:", result.state);
            
            if (result.state === 'denied') {
              setStatus(prev => ({ 
                ...prev, 
                hasLocationPermission: false,
                lastError: "Permisos de ubicación denegados"
              }));
              toast({
                title: "Permisos denegados",
                description: "Los permisos de ubicación han sido denegados. Por favor, habilítalos en la configuración del navegador.",
                variant: "destructive",
              });
              return false;
            }
            
            setStatus(prev => ({ ...prev, hasLocationPermission: true }));
          } catch (error) {
            console.log("⚠️ Permissions API not fully supported, will try direct access");
            setStatus(prev => ({ ...prev, hasLocationPermission: true }));
          }
        } else {
          console.log("🌐 Permissions API not available, assuming permissions are granted");
          setStatus(prev => ({ ...prev, hasLocationPermission: true }));
        }
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
  }, [isNative, isCapacitor, toast]);

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

  // Get current location manually with enhanced error handling and GPS stabilization
  const getCurrentLocation = useCallback(async (): Promise<Position | null> => {
    try {
      console.log(`🔍 Getting current location... (Platform: ${isCapacitor ? 'Native' : 'Web'})`);

      let position: Position | null = null;

      if (!isNative) {
        // Web platform - enhanced browser geolocation
        if (!navigator.geolocation) {
          throw new Error("Geolocalización no disponible en este navegador");
        }

        position = await new Promise<Position | null>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              console.log("📍 Location obtained (Web/WiFi):", {
                lat: pos.coords.latitude.toFixed(6),
                lng: pos.coords.longitude.toFixed(6),
                accuracy: pos.coords.accuracy
              });
              console.log("🎯 Web Geolocation Accuracy:", pos.coords.accuracy, "meters");
              console.log("🌐 Using browser geolocation (WiFi/IP-based)");
              resolve(pos);
            },
            (error) => {
              console.error("❌ Error getting location (Web):", error);
              let errorMessage = "Error de ubicación desconocido";
              switch (error.code) {
                case error.PERMISSION_DENIED:
                  errorMessage = "Permisos de ubicación denegados";
                  break;
                case error.POSITION_UNAVAILABLE:
                  errorMessage = "Ubicación no disponible";
                  break;
                case error.TIMEOUT:
                  errorMessage = "Timeout al obtener ubicación";
                  break;
              }
              setStatus(prev => ({ 
                ...prev, 
                isLocationAvailable: false,
                lastError: errorMessage
              }));
              resolve(null);
            },
            {
              enableHighAccuracy: true, // Request highest accuracy available
              timeout: 30000, // Increased timeout for web
              maximumAge: 60000, // Allow slightly older readings for web
            }
          );
        });
      } else {
        // Native platform - high precision GPS
        position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 20000,
        });
        console.log("📍 Location obtained (Native/GPS):", {
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6),
          accuracy: position.coords.accuracy
        });
        console.log("🎯 Native GPS Accuracy:", position.coords.accuracy, "meters");
        console.log("🛰️ Using native GPS");
      }

      if (!position) {
        return null;
      }

      // Apply platform-specific validation and stabilization
      if (isNative) {
        // Native: strict validation for GPS readings
        if (!validateNewReading(position)) {
          console.log("⚠️ GPS reading rejected, using last stable position");
          return lastStablePositionRef.current;
        }
        
        // Add to buffer and get stable position for native GPS
        addToLocationBuffer(position);
        const stablePosition = getStablePosition();
        
        if (stablePosition) {
          lastStablePositionRef.current = stablePosition;
          setStatus(prev => ({ ...prev, isLocationAvailable: true, lastError: null }));
          console.log("📍 Stable GPS position calculated:", {
            lat: stablePosition.coords.latitude.toFixed(6),
            lng: stablePosition.coords.longitude.toFixed(6),
            accuracy: stablePosition.coords.accuracy.toFixed(1),
            bufferSize: locationBufferRef.current.length
          });
        }
        
        return stablePosition;
      } else {
        // Web: less strict validation, accept browser's best effort
        lastStablePositionRef.current = position;
        setStatus(prev => ({ ...prev, isLocationAvailable: true, lastError: null }));
        console.log("📍 Web location accepted:", {
          lat: position.coords.latitude.toFixed(6),
          lng: position.coords.longitude.toFixed(6),
          accuracy: position.coords.accuracy.toFixed(1),
          source: "Browser Geolocation"
        });
        
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
      
      // Provide platform-specific error guidance
      const platform = isCapacitor ? "dispositivo móvil" : "navegador web";
      toast({
        title: "Error de ubicación",
        description: `No se pudo obtener la ubicación en ${platform}: ${errorMessage}`,
        variant: "destructive",
      });
      return null;
    }
  }, [isNative, isCapacitor, toast, validateNewReading, addToLocationBuffer, getStablePosition]);

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

        // Implement hysteresis and consecutive confirmation system
        const placeStateKey = place.id;
        const currentState = nearPlacesStateRef.current.get(placeStateKey) || { 
          isNear: false, 
          consecutiveCount: 0 
        };
        
        // Calculate adaptive proximity thresholds based on place type/category
        const adaptiveThresholds = getAdaptiveProximityThresholds(place);
        const { NEAR_THRESHOLD, FAR_THRESHOLD, ARRIVAL_THRESHOLD } = adaptiveThresholds;
        const CONSECUTIVE_REQUIRED = 2; // readings required to confirm state change
        
        // Log adaptive radius info for debugging (first time only)
        const debugKey = `${place.id}-debug-logged`;
        if (!notifiedPlacesRef.current.has(debugKey)) {
          logAdaptiveRadiusInfo(place, adaptiveThresholds);
          notifiedPlacesRef.current.add(debugKey);
        }
        
        let shouldBeNear = false;
        
        // Determine if place should be considered near based on hysteresis
        if (currentState.isNear) {
          // Currently near - use higher threshold to determine if we've moved away
          shouldBeNear = distance <= FAR_THRESHOLD;
        } else {
          // Currently far - use lower threshold to determine if we've moved closer
          shouldBeNear = distance <= NEAR_THRESHOLD;
        }
        
        // Update consecutive count
        if (shouldBeNear === currentState.isNear) {
          // State hasn't changed, reset counter
          currentState.consecutiveCount = 0;
        } else {
          // State wants to change, increment counter
          currentState.consecutiveCount++;
        }
        
        // Update state only if we have enough consecutive confirmations
        let actuallyNear = currentState.isNear;
        if (currentState.consecutiveCount >= CONSECUTIVE_REQUIRED) {
          actuallyNear = shouldBeNear;
          currentState.isNear = shouldBeNear;
          currentState.consecutiveCount = 0;
          console.log(`🔄 ${place.name}: State changed to ${shouldBeNear ? 'NEAR' : 'FAR'} after ${CONSECUTIVE_REQUIRED} consecutive readings`);
        }
        
        // Update the state map
        nearPlacesStateRef.current.set(placeStateKey, currentState);

        console.log(
          `   📏 Distance: ${distance.toFixed(0)}m | State: ${actuallyNear ? 'NEAR' : 'FAR'} | Consecutive: ${currentState.consecutiveCount}/${CONSECUTIVE_REQUIRED}`
        );

        // Only process places that are actually considered near with our stabilized system
        if (actuallyNear || distance <= config.proximityRadius) {
          console.log(
            `🎯 NEARBY PLACE: ${place.name} (${distance.toFixed(0)}m) - Stable: ${actuallyNear}`
          );

          const nearbyPlace: NearbyPlace = {
            ...place,
            distance,
            hasNotified: {},
          };

          // Check if user has arrived at this place (≤10m) and trigger arrival modal
          // Use consecutive confirmation for arrival too
          const hasArrived = distance <= ARRIVAL_THRESHOLD;
          const arrivalKey = `${place.id}-arrival`;
          const hasArrivedBefore = notifiedPlacesRef.current.has(arrivalKey);
          
          // For arrival, require the place to be stably near AND within arrival threshold
          if (hasArrived && actuallyNear && !hasArrivedBefore && onPlaceArrival) {
            console.log(`🎉 User arrived at ${place.name}! Triggering arrival modal (stable reading)`);
            
            // Mark as arrived to prevent duplicate modals
            notifiedPlacesRef.current.add(arrivalKey);
            
            // Trigger arrival modal
            onPlaceArrival({
              id: place.id,
              name: place.name,
              distance: Math.round(distance),
              category: place.category,
              image: place.image,
              tripId: place.tripId,
              country: place.country,
              city: place.city,
              formatted_address: place.formattedAddress,
              rating: place.rating,
            });
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