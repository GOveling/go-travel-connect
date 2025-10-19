// Active Route Context - Global state for turn-by-turn navigation

import React, { createContext, useContext, useCallback, useEffect, useState } from 'react';
import { ActiveRoute, NavigationLeg, RouteProgress } from '@/types/navigation';
import { navigationService } from '@/services/NavigationService';
import { useTravelModeContext } from './TravelModeContext';

interface ActiveRouteContextType {
  activeRoute: ActiveRoute | null;
  currentLeg: NavigationLeg | null;
  routeProgress: RouteProgress | null;
  isNavigating: boolean;
  
  // Route management
  createRoute: (
    places: Array<{ lat: number; lng: number; name: string; place_id?: string }>,
    mode: 'walking' | 'driving' | 'transit' | 'bicycling',
    trip_id: string
  ) => Promise<boolean>;
  startNavigation: () => boolean;
  pauseNavigation: () => void;
  resumeNavigation: () => void;
  completeCurrentLeg: () => boolean;
  skipCurrentLeg: () => boolean;
  endNavigation: () => void;
  
  // Progress tracking
  updateRouteProgress: (location: { lat: number; lng: number }) => void;
  
  // Integration with Travel Mode
  setActiveDestination: (place: { lat: number; lng: number; name: string; id: string }) => void;
  markDestinationVisited: (place_id: string) => void;
}

const ActiveRouteContext = createContext<ActiveRouteContextType | null>(null);

export const useActiveRoute = () => {
  const context = useContext(ActiveRouteContext);
  if (!context) {
    throw new Error('useActiveRoute must be used within an ActiveRouteProvider');
  }
  return context;
};

export const ActiveRouteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRoute, setActiveRoute] = useState<ActiveRoute | null>(null);
  const [currentLeg, setCurrentLeg] = useState<NavigationLeg | null>(null);
  const [routeProgress, setRouteProgress] = useState<RouteProgress | null>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  
  // Integration with Travel Mode
  const { currentPosition, checkProximity } = useTravelModeContext();

  // Create a new navigation route
  const createRoute = useCallback(async (
    places: Array<{ lat: number; lng: number; name: string; place_id?: string }>,
    mode: 'walking' | 'driving' | 'transit' | 'bicycling',
    trip_id: string
  ): Promise<boolean> => {
    try {
      console.log("🗺️ Creating navigation route:", { places: places.length, mode });
      
      const route = await navigationService.createNavigationRoute(places, mode, trip_id);
      if (route) {
        setActiveRoute(route);
        setCurrentLeg(route.legs[0] || null);
        console.log("✅ Route created successfully");
        return true;
      }
      return false;
    } catch (error) {
      console.error("❌ Error creating route:", error);
      return false;
    }
  }, []);

  // Start navigation
  const startNavigation = useCallback((): boolean => {
    if (navigationService.startNavigation()) {
      setIsNavigating(true);
      
      // Update local state
      const route = navigationService.getActiveRoute();
      if (route) {
        setActiveRoute(route);
        setCurrentLeg(route.legs[route.current_leg_index] || null);
        
        // Set first destination as active in Travel Mode
        const firstDestination = route.legs[0]?.destination;
        if (firstDestination) {
          setActiveDestination({
            lat: firstDestination.location.lat,
            lng: firstDestination.location.lng,
            name: firstDestination.name,
            id: firstDestination.place_id || 'temp-id'
          });
        }
      }
      
      console.log("🧭 Navigation started");
      return true;
    }
    return false;
  }, []);

  // Pause navigation
  const pauseNavigation = useCallback(() => {
    if (activeRoute) {
      const updatedRoute = { ...activeRoute, status: 'paused' as const };
      setActiveRoute(updatedRoute);
      setIsNavigating(false);
      console.log("⏸️ Navigation paused");
    }
  }, [activeRoute]);

  // Resume navigation
  const resumeNavigation = useCallback(() => {
    if (activeRoute && activeRoute.status === 'paused') {
      const updatedRoute = { ...activeRoute, status: 'active' as const };
      setActiveRoute(updatedRoute);
      setIsNavigating(true);
      console.log("▶️ Navigation resumed");
    }
  }, [activeRoute]);

  // Complete current leg and advance
  const completeCurrentLeg = useCallback((): boolean => {
    if (navigationService.completeCurrentLeg()) {
      const updatedRoute = navigationService.getActiveRoute();
      const updatedCurrentLeg = navigationService.getCurrentLeg();
      
      setActiveRoute(updatedRoute);
      setCurrentLeg(updatedCurrentLeg);
      
      // Update active destination for Travel Mode
      if (updatedCurrentLeg) {
        setActiveDestination({
          lat: updatedCurrentLeg.destination.location.lat,
          lng: updatedCurrentLeg.destination.location.lng,
          name: updatedCurrentLeg.destination.name,
          id: updatedCurrentLeg.destination.place_id || 'temp-id'
        });
      }
      
      // Check if route is completed
      if (updatedRoute?.status === 'completed') {
        setIsNavigating(false);
        console.log("🎯 Route completed!");
      }
      
      return true;
    }
    return false;
  }, []);

  // Skip current leg
  const skipCurrentLeg = useCallback((): boolean => {
    if (!activeRoute || !currentLeg) return false;

    // Mark current leg as skipped
    const updatedLegs = [...activeRoute.legs];
    updatedLegs[activeRoute.current_leg_index] = {
      ...currentLeg,
      status: 'skipped'
    };

    // Advance to next leg
    const nextLegIndex = activeRoute.current_leg_index + 1;
    if (nextLegIndex < updatedLegs.length) {
      updatedLegs[nextLegIndex] = {
        ...updatedLegs[nextLegIndex],
        status: 'active'
      };

      const updatedRoute: ActiveRoute = {
        ...activeRoute,
        legs: updatedLegs,
        current_leg_index: nextLegIndex
      };

      setActiveRoute(updatedRoute);
      setCurrentLeg(updatedLegs[nextLegIndex]);

      // Update active destination
      setActiveDestination({
        lat: updatedLegs[nextLegIndex].destination.location.lat,
        lng: updatedLegs[nextLegIndex].destination.location.lng,
        name: updatedLegs[nextLegIndex].destination.name,
        id: updatedLegs[nextLegIndex].destination.place_id || 'temp-id'
      });

      console.log("⏭️ Leg skipped, advancing to:", updatedLegs[nextLegIndex].destination.name);
      return true;
    } else {
      // No more legs, complete route
      endNavigation();
      return true;
    }
  }, [activeRoute, currentLeg]);

  // End navigation
  const endNavigation = useCallback(() => {
    setActiveRoute(null);
    setCurrentLeg(null);
    setRouteProgress(null);
    setIsNavigating(false);
    navigationService.reset();
    console.log("🏁 Navigation ended");
  }, []);

  // Update route progress based on current location
  const updateRouteProgress = useCallback((location: { lat: number; lng: number }) => {
    if (!currentLeg || !isNavigating) return;

    const progress = navigationService.calculateRouteProgress(location);
    if (progress) {
      setRouteProgress(progress);
      
      // Check if user arrived at destination (within arrival radius)
      const arrivalRadius = 50; // meters - could be dynamic based on venue size
      if (progress.distance_to_destination <= arrivalRadius) {
        console.log("📍 Arrived at destination:", currentLeg.destination.name);
        // Could trigger automatic leg completion here
      }
    }
  }, [currentLeg, isNavigating]);

  // Set active destination for Travel Mode integration
  const setActiveDestination = useCallback((place: { lat: number; lng: number; name: string; id: string }) => {
    // This would integrate with Travel Mode to set the current target
    console.log("🎯 Active destination set:", place.name);
  }, []);

  // Mark destination as visited
  const markDestinationVisited = useCallback((place_id: string) => {
    if (!activeRoute) return;

    // Find the leg with this destination and mark as completed
    const legIndex = activeRoute.legs.findIndex(
      leg => leg.destination.place_id === place_id
    );

    if (legIndex !== -1 && legIndex === activeRoute.current_leg_index) {
      console.log("✅ Destination visited, completing leg");
      completeCurrentLeg();
    }
  }, [activeRoute, completeCurrentLeg]);

  // Update route progress when location changes
  useEffect(() => {
    if (currentPosition && isNavigating) {
      updateRouteProgress({
        lat: currentPosition.coords.latitude,
        lng: currentPosition.coords.longitude
      });
    }
  }, [currentPosition, isNavigating, updateRouteProgress]);

  // Listen to navigation service events
  useEffect(() => {
    const handleNavigationEvent = (event: any) => {
      console.log("🔄 Navigation event:", event.type);
      
      switch (event.type) {
        case 'leg_completed':
          setActiveRoute(event.route);
          setCurrentLeg(event.next_leg);
          break;
        case 'route_completed':
          setIsNavigating(false);
          break;
      }
    };

    navigationService.addEventListener(handleNavigationEvent);
    
    return () => {
      navigationService.removeEventListener(handleNavigationEvent);
    };
  }, []);

  const value: ActiveRouteContextType = {
    activeRoute,
    currentLeg,
    routeProgress,
    isNavigating,
    
    createRoute,
    startNavigation,
    pauseNavigation,
    resumeNavigation,
    completeCurrentLeg,
    skipCurrentLeg,
    endNavigation,
    
    updateRouteProgress,
    
    setActiveDestination,
    markDestinationVisited
  };

  return (
    <ActiveRouteContext.Provider value={value}>
      {children}
    </ActiveRouteContext.Provider>
  );
};