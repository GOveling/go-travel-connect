import React, { createContext, useContext, useState } from 'react';
import { useTravelModeSimple } from '@/hooks/useTravelModeSimple';

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

interface TravelModeContextType {
  config: {
    isEnabled?: boolean;
    proximityRadius: number;
    baseCheckInterval: number;
    notificationCooldown: number;
    notificationThresholds: number[];
  };
  currentPosition: {
    lat: number;
    lng: number;
    accuracy?: number;
    coords?: {
      latitude: number;
      longitude: number;
      accuracy: number;
    };
  } | null;
  nearbyPlaces: Array<{
    id: string;
    name: string;
    distance: number;
    tripId: string;
    category?: string;
    priority?: string;
    lat?: number;
    lng?: number;
  }>;
  isTracking: boolean;
  loading: boolean;
  status: any;
  currentSpeed: number; // Speed in m/s
  isStationary: boolean;
  showArrivalModal: boolean;
  arrivalPlace: PlaceArrivalData | null;
  setShowArrivalModal: (show: boolean) => void;
  checkProximity?: () => void;
  toggleTravelMode: () => Promise<void>;
  startTravelMode: () => Promise<void>;
  stopTravelMode: () => void;
  checkLocationPermissions: () => Promise<void>;
  checkNotificationPermissions: () => Promise<void>;
  getActiveTripToday: () => any;
  calculateDistance: (lat1: number, lng1: number, lat2: number, lng2: number) => number;
}

const TravelModeContext = createContext<TravelModeContextType | undefined>(undefined);

export const TravelModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showArrivalModal, setShowArrivalModal] = useState(false);
  const [arrivalPlace, setArrivalPlace] = useState<PlaceArrivalData | null>(null);

  const handlePlaceArrival = (place: PlaceArrivalData) => {
    console.log('🎯 Place arrival detected:', place);
    setArrivalPlace(place);
    setShowArrivalModal(true);
  };

  // Initialize the hook with proper error handling
  const hook = useTravelModeSimple({
    config: {
      isEnabled: false, // Travel mode disabled by default
      proximityRadius: 5000, // 5km detection radius
      baseCheckInterval: 15000,
      notificationCooldown: 300000,
      notificationThresholds: [5000, 2000, 1000, 500, 100, 50, 10],
    },
    onPlaceArrival: handlePlaceArrival,
  });

  const value: TravelModeContextType = {
    config: {
      isEnabled: hook.config.isEnabled,
      proximityRadius: hook.config.proximityRadius,
      baseCheckInterval: hook.config.baseCheckInterval,
      notificationCooldown: hook.config.notificationCooldown,
      notificationThresholds: hook.config.notificationThresholds,
    },
    currentPosition: hook.currentPosition ? {
      lat: hook.currentPosition.coords?.latitude || 0,
      lng: hook.currentPosition.coords?.longitude || 0,
      accuracy: hook.currentPosition.coords?.accuracy,
      coords: {
        latitude: hook.currentPosition.coords?.latitude || 0,
        longitude: hook.currentPosition.coords?.longitude || 0,
        accuracy: hook.currentPosition.coords?.accuracy || 0,
      }
    } : null,
    nearbyPlaces: hook.nearbyPlaces,
    isTracking: hook.isTracking,
    loading: hook.loading,
    status: hook.status,
    currentSpeed: hook.currentSpeed,
    isStationary: hook.isStationary,
    showArrivalModal,
    arrivalPlace,
    setShowArrivalModal,
    checkProximity: () => {},
    toggleTravelMode: async () => { await hook.toggleTravelMode(); return; },
    startTravelMode: async () => { await hook.startTravelMode(); },
    stopTravelMode: hook.stopTravelMode,
    checkLocationPermissions: async () => { hook.checkLocationPermissions(); },
    checkNotificationPermissions: async () => { hook.checkNotificationPermissions(); },
    getActiveTripToday: hook.getActiveTripToday,
    calculateDistance: hook.calculateDistance,
  };

  return (
    <TravelModeContext.Provider value={value}>
      {children}
    </TravelModeContext.Provider>
  );
};

export const useTravelModeContext = () => {
  const context = useContext(TravelModeContext);
  if (context === undefined) {
    // Return a default safe state instead of throwing an error
    return {
      config: { 
        isEnabled: false, 
        proximityRadius: 5000, // 5km detection radius
        baseCheckInterval: 15000, 
        notificationCooldown: 300000, 
        notificationThresholds: [] 
      },
      currentPosition: null,
      nearbyPlaces: [],
      isTracking: false,
      loading: false,
      status: {},
      currentSpeed: 0,
      isStationary: false,
      showArrivalModal: false,
      arrivalPlace: null,
      setShowArrivalModal: () => {},
      checkProximity: () => {},
      toggleTravelMode: async () => {},
      startTravelMode: async () => {},
      stopTravelMode: () => {},
      checkLocationPermissions: async () => {},
      checkNotificationPermissions: async () => {},
      getActiveTripToday: () => null,
      calculateDistance: () => 0,
    };
  }
  return context;
};