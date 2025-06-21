
import { useSupabaseTrips } from './useSupabaseTrips';
import { useModalState } from './state/useModalState';
import { useNotifications } from './state/useNotifications';

export const useHomeState = () => {
  const { trips, loading, createTrip, updateTrip, deleteTrip, refetchTrips } = useSupabaseTrips();
  const modalState = useModalState();
  const notifications = useNotifications();

  const setTrips = async (newTripsOrUpdater: any) => {
    // This function is kept for compatibility but now we use specific CRUD operations
    console.warn('setTrips is deprecated, use createTrip, updateTrip, or deleteTrip instead');
  };

  return {
    trips,
    loading,
    setTrips,
    createTrip,
    updateTrip,
    deleteTrip,
    refetchTrips,
    ...modalState,
    ...notifications
  };
};
