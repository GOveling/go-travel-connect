
import { useSupabaseTrips } from "../useSupabaseTrips";

export const useHomeData = () => {
  const { trips, loading, createTrip, updateTrip, deleteTrip, refetchTrips } = useSupabaseTrips();

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
    refetchTrips
  };
};
