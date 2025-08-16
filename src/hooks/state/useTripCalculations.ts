import { Trip } from "@/types";
import {
  calculateTripsWithDynamicStatus,
  findCurrentTrip,
} from "../utils/tripUtils";

export const useTripCalculations = (trips: Trip[]) => {
  // Calculate dynamic trip statuses and find current/upcoming trip
  const tripsWithDynamicStatus = calculateTripsWithDynamicStatus(trips);
  const travelingTrip = tripsWithDynamicStatus.find(
    (trip) => trip.status === "traveling"
  );
  const upcomingTrips = tripsWithDynamicStatus
    .filter((trip) => trip.status === "upcoming")
    .sort((a, b) => {
      const aTime = a.startDate ? a.startDate.getTime() : Number.MAX_SAFE_INTEGER;
      const bTime = b.startDate ? b.startDate.getTime() : Number.MAX_SAFE_INTEGER;
      return aTime - bTime;
    });

  const nearestUpcomingTrip = upcomingTrips.find((trip) => {
    try {
      const startDate = trip.startDate;
      if (!startDate) return false;
      
      const currentDate = new Date();
      const daysDifference = Math.ceil(
        (startDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      return daysDifference <= 40 && daysDifference > 0;
    } catch {
      return false;
    }
  });

  const currentTrip = findCurrentTrip(tripsWithDynamicStatus);

  return {
    currentTrip,
    travelingTrip,
    nearestUpcomingTrip,
    tripsWithDynamicStatus,
  };
};
