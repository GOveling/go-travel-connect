
import { useHomeState } from "./useHomeState";

export const useHomeHandlers = (homeState: ReturnType<typeof useHomeState>) => {
  const {
    setIsNotificationModalOpen,
    setIsNewTripModalOpen,
    setIsTripDetailModalOpen,
    setNotificationCount,
    setTrips
  } = homeState;

  const handleNotificationClick = () => {
    setIsNotificationModalOpen(true);
  };

  const handleMarkAllNotificationsRead = () => {
    setNotificationCount(0);
  };

  const handleCreateTrip = (tripData: any) => {
    setTrips(prev => [...prev, tripData]);
  };

  const handleViewCurrentTripDetail = () => {
    setIsTripDetailModalOpen(true);
  };

  const handlePlanNewTrip = () => {
    setIsNewTripModalOpen(true);
  };

  const handleNavigateToTrips = () => {
    // Dispatch custom event to navigate to trips section
    window.dispatchEvent(new CustomEvent('navigateToTrips'));
  };

  return {
    handleNotificationClick,
    handleMarkAllNotificationsRead,
    handleCreateTrip,
    handleViewCurrentTripDetail,
    handlePlanNewTrip,
    handleNavigateToTrips
  };
};
