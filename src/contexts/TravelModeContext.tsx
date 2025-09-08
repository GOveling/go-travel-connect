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
  
  const travelModeHook = useTravelModeSimple();
  
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
    throw new Error('useTravelModeContext must be used within a TravelModeProvider');
  }
  return context;
};