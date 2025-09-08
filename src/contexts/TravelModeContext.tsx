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
    proximityRadius: number;
    baseCheckInterval: number;
    notificationCooldown: number;
    notificationThresholds: number[];
  };
  currentPosition: {
    lat: number;
    lng: number;
    accuracy?: number;
  } | null;
  nearbyPlaces: Array<{
    id: string;
    name: string;
    distance: number;
    tripId: string;
  }>;
  isTracking: boolean;
  loading: boolean;
  status: any;
  showArrivalModal: boolean;
  arrivalPlace: PlaceArrivalData | null;
  setShowArrivalModal: (show: boolean) => void;
  toggleTravelMode: () => Promise<void>;
  startTravelMode: () => Promise<void>;
  stopTravelMode: () => void;
  checkLocationPermissions: () => Promise<boolean>;
  checkNotificationPermissions: () => Promise<boolean>;
  getActiveTripToday: () => Promise<any>;
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
  const {
    config,
    currentPosition,
    nearbyPlaces,
    isTracking,
    loading,
    status,
    toggleTravelMode,
    startTravelMode,
    stopTravelMode,
    checkLocationPermissions,
    checkNotificationPermissions,
    getActiveTripToday,
    calculateDistance,
  } = useTravelModeSimple({ 
    config: {
      proximityRadius: 100,
      baseCheckInterval: 15000,
      notificationCooldown: 300000,
      notificationThresholds: [10000, 5000, 2000, 1000, 500, 100, 50, 10],
    },
    onPlaceArrival: handlePlaceArrival,
  });

  const value: TravelModeContextType = {
    config,
    currentPosition,
    nearbyPlaces,
    isTracking,
    loading,
    status,
    showArrivalModal,
    arrivalPlace,
    setShowArrivalModal,
    toggleTravelMode,
    startTravelMode,
    stopTravelMode,
    checkLocationPermissions,
    checkNotificationPermissions,
    getActiveTripToday,
    calculateDistance,
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
      config: { proximityRadius: 100, baseCheckInterval: 15000, notificationCooldown: 300000, notificationThresholds: [] },
      currentPosition: null,
      nearbyPlaces: [],
      isTracking: false,
      loading: false,
      status: {},
      showArrivalModal: false,
      arrivalPlace: null,
      setShowArrivalModal: () => {},
      toggleTravelMode: async () => {},
      startTravelMode: async () => {},
      stopTravelMode: () => {},
      checkLocationPermissions: async () => false,
      checkNotificationPermissions: async () => false,
      getActiveTripToday: async () => null,
      calculateDistance: () => 0,
    };
  }
  return context;
};