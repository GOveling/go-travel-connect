import { useState, useCallback, useEffect } from "react";
import { RouteSegment } from "@/hooks/useGoogleDirections";
import { UserLocation } from "@/hooks/useUserLocation";
import { calculateDistance } from "@/utils/locationUtils";

interface NavigationStep {
  instruction: string;
  distance: string;
  duration: string;
  segmentIndex: number;
  stepIndex: number;
  fromPlace: string;
  toPlace: string;
  mode: string;
  coordinates?: { lat: number; lng: number };
}

export const useNavigation = () => {
  const [isNavigating, setIsNavigating] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [routeSegments, setRouteSegments] = useState<RouteSegment[]>([]);
  const [allSteps, setAllSteps] = useState<NavigationStep[]>([]);

  // Process route segments into navigation steps
  const processRouteSegments = useCallback((segments: RouteSegment[]) => {
    const steps: NavigationStep[] = [];
    
    segments.forEach((segment, segmentIdx) => {
      segment.result.steps.forEach((step, stepIdx) => {
        steps.push({
          ...step,
          segmentIndex: segmentIdx,
          stepIndex: stepIdx,
          fromPlace: segment.from,
          toPlace: segment.to,
          mode: segment.mode,
        });
      });
    });

    setAllSteps(steps);
    return steps;
  }, []);

  // Start navigation
  const startNavigation = useCallback((segments: RouteSegment[]) => {
    setRouteSegments(segments);
    const steps = processRouteSegments(segments);
    
    if (steps.length > 0) {
      setCurrentStepIndex(0);
      setIsNavigating(true);
      return true;
    }
    return false;
  }, [processRouteSegments]);

  // Stop navigation
  const stopNavigation = useCallback(() => {
    setIsNavigating(false);
    setCurrentStepIndex(0);
    setRouteSegments([]);
    setAllSteps([]);
    
    // Stop any ongoing speech synthesis
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  }, []);

  // Navigate to specific step
  const goToStep = useCallback((stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < allSteps.length) {
      setCurrentStepIndex(stepIndex);
    }
  }, [allSteps.length]);

  // Go to next step
  const nextStep = useCallback(() => {
    if (currentStepIndex < allSteps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  }, [currentStepIndex, allSteps.length]);

  // Go to previous step
  const previousStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
  }, [currentStepIndex]);

  // Check proximity to next step (simplified for demo)
  const checkStepProximity = useCallback((userLocation: UserLocation) => {
    if (!isNavigating || !allSteps[currentStepIndex]) return false;

    // In a real implementation, you would:
    // 1. Compare user location with step coordinates
    // 2. Check if user is within proximity threshold (e.g., 50 meters)
    // 3. Auto-advance to next step when close enough
    
    const currentStep = allSteps[currentStepIndex];
    // For demo purposes, we'll return false
    // In reality: calculateDistance(userLocation, stepCoordinates) < 0.05 (50m)
    
    return false;
  }, [isNavigating, allSteps, currentStepIndex]);

  // Auto-advance step based on location (demo implementation)
  const autoAdvanceStep = useCallback((userLocation: UserLocation) => {
    if (checkStepProximity(userLocation)) {
      nextStep();
    }
  }, [checkStepProximity, nextStep]);

  // Get current step
  const getCurrentStep = useCallback(() => {
    return allSteps[currentStepIndex] || null;
  }, [allSteps, currentStepIndex]);

  // Get navigation progress
  const getProgress = useCallback(() => {
    if (allSteps.length === 0) return 0;
    return ((currentStepIndex + 1) / allSteps.length) * 100;
  }, [allSteps.length, currentStepIndex]);

  // Get remaining steps
  const getRemainingSteps = useCallback(() => {
    return allSteps.slice(currentStepIndex + 1);
  }, [allSteps, currentStepIndex]);

  // Get completed steps
  const getCompletedSteps = useCallback(() => {
    return allSteps.slice(0, currentStepIndex);
  }, [allSteps, currentStepIndex]);

  // Check if navigation is complete
  const isComplete = currentStepIndex >= allSteps.length - 1 && allSteps.length > 0;

  return {
    // State
    isNavigating,
    currentStepIndex,
    allSteps,
    routeSegments,
    isComplete,

    // Actions
    startNavigation,
    stopNavigation,
    goToStep,
    nextStep,
    previousStep,
    autoAdvanceStep,

    // Getters
    getCurrentStep,
    getProgress,
    getRemainingSteps,
    getCompletedSteps,
    
    // Utils
    checkStepProximity,
  };
};