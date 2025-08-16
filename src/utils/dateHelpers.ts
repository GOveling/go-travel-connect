import { format } from "date-fns";

// Helper function to get formatted date range from startDate and endDate
export const getFormattedDateRange = (startDate?: Date, endDate?: Date): string => {
  if (!startDate && !endDate) {
    return "Dates TBD";
  }
  
  if (startDate && endDate) {
    const startFormatted = format(startDate, "MMM d, yyyy");
    const endFormatted = format(endDate, "MMM d, yyyy");
    return `${startFormatted} - ${endFormatted}`;
  } else if (startDate) {
    return format(startDate, "MMM d, yyyy");
  } else if (endDate) {
    return `Until ${format(endDate, "MMM d, yyyy")}`;
  }
  
  return "No dates set";
};

// Helper function to extract start date from either Date object or legacy date string
export const getStartDate = (trip: { startDate?: Date; endDate?: Date }): Date => {
  if (trip.startDate) {
    return trip.startDate;
  }
  // Default to today if no date available
  return new Date();
};

// Helper function to extract end date from either Date object or legacy date string
export const getEndDate = (trip: { startDate?: Date; endDate?: Date }): Date => {
  if (trip.endDate) {
    return trip.endDate;
  }
  if (trip.startDate) {
    // Default to 7 days from start if no end date
    const defaultEnd = new Date(trip.startDate);
    defaultEnd.setDate(defaultEnd.getDate() + 7);
    return defaultEnd;
  }
  // Default to 7 days from today
  const defaultEnd = new Date();
  defaultEnd.setDate(defaultEnd.getDate() + 7);
  return defaultEnd;
};

// Helper function to get trip year for grouping
export const getTripYear = (trip: { startDate?: Date; endDate?: Date }): number => {
  const startDate = getStartDate(trip);
  return startDate.getFullYear();
};