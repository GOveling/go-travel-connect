
import { useModalState } from "./state/useModalState";
import { useHomeData } from "./state/useHomeData";
import { useNotifications } from "./state/useNotifications";
import { useSelectedItems } from "./state/useSelectedItems";
import { useTripCalculations } from "./state/useTripCalculations";
import { addPlaceToTripUtil } from "./utils/tripUtils";

export const useHomeState = () => {
  const modalState = useModalState();
  const homeData = useHomeData();
  const notifications = useNotifications();
  const selectedItems = useSelectedItems();
  const tripCalculations = useTripCalculations(homeData.trips);

  // Function to add a place to a trip
  const addPlaceToTrip = (tripId: number, place: any) => {
    homeData.setTrips(prev => addPlaceToTripUtil(prev, tripId, place));
  };

  return {
    // Modal states
    ...modalState,
    
    // Data states
    ...homeData,
    
    // Notifications
    ...notifications,
    
    // Selected items
    ...selectedItems,
    
    // Trip calculations
    ...tripCalculations,
    
    // Actions
    addPlaceToTrip
  };
};
