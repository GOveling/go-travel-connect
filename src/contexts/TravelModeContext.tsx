import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTravelModeSimple } from '@/hooks/useTravelModeSimple';

interface TravelModeContextType {
  config: any;
  currentPosition: any;
  nearbyPlaces: any[];
  isTracking: boolean;
  loading: boolean;
  status: any;
  toggleTravelMode: () => void;
  checkProximity: () => void;
  checkLocationPermissions: () => void;
  checkNotificationPermissions: () => void;
  getActiveTripToday: () => void;
  isInitialized: boolean;
}

const TravelModeContext = createContext<TravelModeContextType | undefined>(undefined);

export const TravelModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Safely initialize the travel mode hook with error handling
  let travelModeHook;
  try {
    travelModeHook = useTravelModeSimple();
  } catch (error) {
    console.warn('TravelModeSimple hook failed to initialize:', error);
    travelModeHook = {
      config: { isEnabled: false },
      currentPosition: null,
      nearbyPlaces: [],
      isTracking: false,
      loading: false,
      status: {},
      toggleTravelMode: () => {},
      checkProximity: () => {},
      checkLocationPermissions: () => {},
      checkNotificationPermissions: () => {},
      getActiveTripToday: () => {},
    };
  }
  
  // Initialize the context only once
  useEffect(() => {
    if (!isInitialized) {
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const contextValue = {
    ...travelModeHook,
    isInitialized,
  };

  return (
    <TravelModeContext.Provider value={contextValue}>
      {children}
    </TravelModeContext.Provider>
  );
};

export const useTravelModeContext = () => {
  const context = useContext(TravelModeContext);
  if (context === undefined) {
    // Return a default safe state instead of throwing an error
    return {
      config: { isEnabled: false },
      currentPosition: null,
      nearbyPlaces: [],
      isTracking: false,
      loading: false,
      status: {},
      toggleTravelMode: () => {},
      checkProximity: () => {},
      checkLocationPermissions: () => {},
      checkNotificationPermissions: () => {},
      getActiveTripToday: () => {},
      isInitialized: false,
    };
  }
  return context;
};