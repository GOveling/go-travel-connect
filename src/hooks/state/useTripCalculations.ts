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
      const getStartDate = (dates: string) => {
        try {
          const startDateStr = dates.split(" - ")[0];
          const year =
            dates.split(", ")[1] || new Date().getFullYear().toString();
          const month = startDateStr.split(" ")[0];
          const day = parseInt(startDateStr.split(" ")[1]);

          const monthMap: { [key: string]: number } = {
            Jan: 0,
            Feb: 1,
            Mar: 2,
            Apr: 3,
            May: 4,
            Jun: 5,
            Jul: 6,
            Aug: 7,
            Sep: 8,
            Oct: 9,
            Nov: 10,
            Dec: 11,
          };

          return new Date(parseInt(year), monthMap[month], day);
        } catch {
          return new Date();
        }
      };

      return getStartDate(a.dates).getTime() - getStartDate(b.dates).getTime();
    });

  const nearestUpcomingTrip = upcomingTrips.find((trip) => {
    try {
      const startDateStr = trip.dates.split(" - ")[0];
      const year =
        trip.dates.split(", ")[1] || new Date().getFullYear().toString();
      const month = startDateStr.split(" ")[0];
      const day = parseInt(startDateStr.split(" ")[1]);

      const monthMap: { [key: string]: number } = {
        Jan: 0,
        Feb: 1,
        Mar: 2,
        Apr: 3,
        May: 4,
        Jun: 5,
        Jul: 6,
        Aug: 7,
        Sep: 8,
        Oct: 9,
        Nov: 10,
        Dec: 11,
      };

      const startDate = new Date(parseInt(year), monthMap[month], day);
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
