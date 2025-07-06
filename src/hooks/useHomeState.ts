
import { useSupabaseTrips } from './useSupabaseTrips';
import { useModalState } from './state/useModalState';
import { useNotifications } from './state/useNotifications';
import { useTripCalculations } from './state/useTripCalculations';

export const useHomeState = () => {
  const { trips, loading, createTrip, updateTrip, deleteTrip, refetchTrips } = useSupabaseTrips();
  const modalState = useModalState();
  const notifications = useNotifications();
  
  // Calculate trip states (current, traveling, upcoming)
  const { currentTrip, travelingTrip, nearestUpcomingTrip } = useTripCalculations(trips);

  const setTrips = async (newTripsOrUpdater: any) => {
    // This function is kept for compatibility but now we use specific CRUD operations
    console.warn('setTrips is deprecated, use createTrip, updateTrip, or deleteTrip instead');
  };

  // Add place to trip function - now using Supabase
  const addPlaceToTrip = async (tripId: string, place: any) => {
    // This function would need to be implemented to save places to Supabase
    // For now, just log the action
    console.log('Adding place to trip:', { tripId, place });
    // TODO: Implement Supabase saved_places insertion
  };

  return {
    trips,
    loading,
    setTrips,
    createTrip,
    updateTrip,
    deleteTrip,
    refetchTrips,
    currentTrip,
    travelingTrip,
    nearestUpcomingTrip,
    addPlaceToTrip,
    ...modalState,
    ...notifications
  };
};
