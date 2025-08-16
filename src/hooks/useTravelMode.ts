import { Geolocation, Position } from "@capacitor/geolocation";
import { useCallback, useEffect, useRef, useState } from "react";
import { travelNotificationService } from "../services/travelNotificationService";
import { SavedPlace, Trip } from "../types";
import { useSupabaseTrips } from "./useSupabaseTrips";

// Extend window type for Capacitor
declare global {
  interface Window {
    Capacitor?: unknown;
  }
}

// Helper function to check if running on web
const isWeb = () => typeof window !== "undefined" && !window.Capacitor;

interface TravelModeConfig {
  isEnabled: boolean;
  proximityRadius: number; // meters
  checkInterval: number; // milliseconds
  notificationThresholds: number[]; // distances in meters [1000, 500, 100]
}

interface NearbyPlace extends SavedPlace {
  distance: number;
  tripId: string;
  tripName: string;
  hasNotified: Record<number, boolean>; // track notifications for each threshold
}

const DEFAULT_CONFIG: TravelModeConfig = {
  isEnabled: false,
  proximityRadius: 2000, // 2km
  checkInterval: 30000, // 30 seconds
  notificationThresholds: [1000, 500, 100], // 1km, 500m, 100m
};

// Storage keys
const STORAGE_KEYS = {
  CONFIG: "travel_mode_config",
  IS_TRACKING: "travel_mode_is_tracking",
  CURRENT_POSITION: "travel_mode_current_position",
  NEARBY_PLACES: "travel_mode_nearby_places",
};

// Global state management
class TravelModeManager {
  private static instance: TravelModeManager;
  private config: TravelModeConfig = DEFAULT_CONFIG;
  private isTracking: boolean = false;
  private watchId: string | null = null;
  private interval: NodeJS.Timeout | null = null;
  private subscribers: Set<() => void> = new Set();
  private currentPosition: Position | null = null;
  private nearbyPlaces: NearbyPlace[] = [];
  private notifiedPlaces: Set<string> = new Set();

  static getInstance(): TravelModeManager {
    if (!TravelModeManager.instance) {
      TravelModeManager.instance = new TravelModeManager();
    }
    return TravelModeManager.instance;
  }

  constructor() {
    this.loadFromStorage();
    // Auto-resume tracking if it was enabled
    if (this.config.isEnabled && !this.isTracking) {
      this.startTracking();
    }
  }

  private loadFromStorage() {
    try {
      const savedConfig = localStorage.getItem(STORAGE_KEYS.CONFIG);
      if (savedConfig) {
        this.config = { ...DEFAULT_CONFIG, ...JSON.parse(savedConfig) };
      }

      const savedTracking = localStorage.getItem(STORAGE_KEYS.IS_TRACKING);
      if (savedTracking) {
        this.isTracking = JSON.parse(savedTracking);
      }

      const savedPosition = localStorage.getItem(STORAGE_KEYS.CURRENT_POSITION);
      if (savedPosition) {
        this.currentPosition = JSON.parse(savedPosition);
      }

      const savedNearbyPlaces = localStorage.getItem(
        STORAGE_KEYS.NEARBY_PLACES
      );
      if (savedNearbyPlaces) {
        this.nearbyPlaces = JSON.parse(savedNearbyPlaces);
      }
    } catch (error) {
      console.error("Error loading travel mode from storage:", error);
    }
  }

  private saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(this.config));
      localStorage.setItem(
        STORAGE_KEYS.IS_TRACKING,
        JSON.stringify(this.isTracking)
      );
      if (this.currentPosition) {
        localStorage.setItem(
          STORAGE_KEYS.CURRENT_POSITION,
          JSON.stringify(this.currentPosition)
        );
      }
      localStorage.setItem(
        STORAGE_KEYS.NEARBY_PLACES,
        JSON.stringify(this.nearbyPlaces)
      );
    } catch (error) {
      console.error("Error saving travel mode to storage:", error);
    }
  }

  subscribe(callback: () => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers() {
    this.subscribers.forEach((callback) => callback());
  }

  getState() {
    return {
      config: this.config,
      isTracking: this.isTracking,
      currentPosition: this.currentPosition,
      nearbyPlaces: this.nearbyPlaces,
    };
  }

  updateConfig(newConfig: Partial<TravelModeConfig>) {
    this.config = { ...this.config, ...newConfig };
    this.saveToStorage();
    this.notifySubscribers();

    // Restart tracking with new config if enabled
    if (this.config.isEnabled && this.isTracking) {
      this.restartTracking();
    }
  }

  updateNearbyPlaces(places: NearbyPlace[]) {
    this.nearbyPlaces = places;
    this.saveToStorage();
    this.notifySubscribers();
  }

  private async restartTracking() {
    await this.stopTracking();
    await this.startTracking();
  }

  async startTracking(): Promise<boolean> {
    try {
      console.log("🚗 Starting travel mode tracking...");

      const hasPermissions = await this.requestPermissions();
      if (!hasPermissions) {
        console.error("Permissions not granted");
        return false;
      }

      const isWebMode = isWeb();

      if (isWebMode) {
        console.log("🌐 Starting tracking with Web Geolocation API");

        // Get initial position
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log("📍 Initial position obtained:", position);
            this.currentPosition = position;
            this.saveToStorage();
            this.notifySubscribers();
          },
          (error) => {
            console.error("Error getting initial position:", error);
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000,
          }
        );

        // Start watching position
        this.watchId = navigator.geolocation.watchPosition(
          (position) => {
            console.log("📍 New position detected:", position);
            this.currentPosition = position;
            this.saveToStorage();
            this.notifySubscribers();
          },
          (error) => {
            console.error("Error in watchPosition:", error);
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 60000,
          }
        ) as unknown as string;
      } else {
        console.log("📱 Starting tracking with Capacitor");
        this.watchId = await Geolocation.watchPosition(
          {
            enableHighAccuracy: true,
            timeout: 10000,
          },
          (position) => {
            if (position) {
              console.log("📍 New position (Capacitor):", position);
              this.currentPosition = position;
              this.saveToStorage();
              this.notifySubscribers();
            }
          }
        );
      }

      // Start periodic proximity checks
      this.interval = setInterval(() => {
        this.checkProximity();
      }, this.config.checkInterval);

      this.isTracking = true;
      this.saveToStorage();
      this.notifySubscribers();
      console.log("🚗 Travel mode started successfully");
      return true;
    } catch (error) {
      console.error("Error starting tracking:", error);
      return false;
    }
  }

  async stopTracking() {
    try {
      if (this.watchId) {
        const isWebMode = isWeb();

        if (isWebMode) {
          navigator.geolocation.clearWatch(this.watchId as unknown as number);
          console.log("🌐 Web geolocation watch cleared");
        } else {
          await Geolocation.clearWatch({ id: this.watchId });
          console.log("📱 Capacitor geolocation watch cleared");
        }

        this.watchId = null;
      }

      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }

      this.isTracking = false;
      this.nearbyPlaces = [];
      this.notifiedPlaces.clear();
      this.saveToStorage();
      this.notifySubscribers();
      console.log("🛑 Travel mode stopped");
    } catch (error) {
      console.error("Error stopping tracking:", error);
    }
  }

  async toggleTravelMode(): Promise<void> {
    if (this.config.isEnabled && this.isTracking) {
      await this.stopTracking();
      this.config.isEnabled = false;
    } else {
      const success = await this.startTracking();
      if (success) {
        this.config.isEnabled = true;
      }
    }
    this.saveToStorage();
    this.notifySubscribers();
  }

  private async requestPermissions(): Promise<boolean> {
    try {
      if (isWeb()) {
        if (!navigator.geolocation) {
          console.error("Geolocation not available in this browser");
          return false;
        }
        await travelNotificationService.initialize();
        return true;
      }

      const locationPermission = await Geolocation.requestPermissions();
      console.log("📱 Capacitor location permission:", locationPermission);
      await travelNotificationService.initialize();
      return locationPermission.location === "granted";
    } catch (error) {
      console.error("Error requesting permissions:", error);
      return isWeb();
    }
  }

  private checkProximity() {
    // This will be called by the hook with trips data
    // Moving this logic to the hook level
  }

  async getCurrentLocation(): Promise<Position | null> {
    try {
      const isWebMode = isWeb();

      if (isWebMode) {
        return new Promise<Position | null>((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log("📍 Location obtained (Web):", position);
              this.currentPosition = position;
              this.saveToStorage();
              this.notifySubscribers();
              resolve(position);
            },
            (error) => {
              console.error("Error getting current location (Web):", error);
              resolve(null);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000,
            }
          );
        });
      } else {
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
        });
        console.log("📍 Location obtained (Capacitor):", position);
        this.currentPosition = position;
        this.saveToStorage();
        this.notifySubscribers();
        return position;
      }
    } catch (error) {
      console.error("Error getting current location:", error);
      return null;
    }
  }
}

export const useTravelMode = () => {
  const manager = TravelModeManager.getInstance();
  const [state, setState] = useState(manager.getState());
  const { trips, loading } = useSupabaseTrips();
  const lastCheckRef = useRef<number>(0);

  // Subscribe to manager updates
  useEffect(() => {
    const unsubscribe = manager.subscribe(() => {
      setState(manager.getState());
    });
    return () => {
      unsubscribe();
    };
  }, [manager]);

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

  // Send proximity notification
  const sendProximityNotification = useCallback(
    async (place: NearbyPlace, threshold: number) => {
      try {
        await travelNotificationService.sendProximityNotification(
          {
            ...place,
            tripId: place.tripId,
            tripName: place.tripName,
          },
          place.distance,
          threshold
        );
      } catch (error) {
        console.error("Error sending notification:", error);
      }
    },
    []
  );

  // Get all saved places from all trips
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

    return allPlaces;
  }, [trips]);

  // Check proximity to saved places
  const checkProximity = useCallback(async () => {
    if (!state.currentPosition || !state.config.isEnabled || !trips) return;

    // Throttle checks to avoid excessive processing
    const now = Date.now();
    if (now - lastCheckRef.current < 5000) return; // Min 5 seconds between checks
    lastCheckRef.current = now;

    const allPlaces = getAllSavedPlaces();
    const userLat = state.currentPosition.coords.latitude;
    const userLng = state.currentPosition.coords.longitude;

    const nearby: NearbyPlace[] = [];

    allPlaces.forEach((place) => {
      if (place.lat && place.lng) {
        const distance = calculateDistance(
          userLat,
          userLng,
          place.lat,
          place.lng
        );

        if (distance <= state.config.proximityRadius) {
          const nearbyPlace: NearbyPlace = {
            ...place,
            distance,
            hasNotified: place.hasNotified || {},
          };

          // Check if we should send notifications for this distance
          state.config.notificationThresholds.forEach((threshold) => {
            if (distance <= threshold && !nearbyPlace.hasNotified[threshold]) {
              sendProximityNotification(nearbyPlace, threshold);
              nearbyPlace.hasNotified[threshold] = true;
            }
          });

          nearby.push(nearbyPlace);
        }
      }
    });

    // Sort by distance and update state
    nearby.sort((a, b) => a.distance - b.distance);

    // Update manager state
    const managerState = manager.getState();
    if (JSON.stringify(managerState.nearbyPlaces) !== JSON.stringify(nearby)) {
      // Update private state through manager
      manager.updateNearbyPlaces(nearby);
      setState(manager.getState());
    }
  }, [
    state.currentPosition,
    state.config,
    trips,
    getAllSavedPlaces,
    calculateDistance,
    sendProximityNotification,
    manager,
  ]);

  // Auto-check proximity when position updates or trips change
  useEffect(() => {
    if (state.currentPosition && state.config.isEnabled && trips) {
      checkProximity();
    }
  }, [state.currentPosition, state.config.isEnabled, trips, checkProximity]);

  return {
    // State
    config: state.config,
    currentPosition: state.currentPosition,
    nearbyPlaces: state.nearbyPlaces,
    isTracking: state.isTracking,
    loading,

    // Actions
    toggleTravelMode: manager.toggleTravelMode.bind(manager),
    updateConfig: manager.updateConfig.bind(manager),
    getCurrentLocation: manager.getCurrentLocation.bind(manager),
    startTracking: manager.startTracking.bind(manager),
    stopTracking: manager.stopTracking.bind(manager),

    // Utilities
    calculateDistance,
  };
};
