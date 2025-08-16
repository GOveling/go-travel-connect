export const calculateTripStatus = (trip: {
  startDate?: Date;
  endDate?: Date;
}): string => {
  const currentDate = new Date();

  const start = trip.startDate ? new Date(trip.startDate) : undefined;
  const end = trip.endDate ? new Date(trip.endDate) : undefined;

  if (!start) return "planning";

  // Zero out time for comparison
  start.setHours(0, 0, 0, 0);
  const endDate = end ? new Date(end) : new Date(start);
  endDate.setHours(0, 0, 0, 0);
  currentDate.setHours(0, 0, 0, 0);

  if (currentDate > endDate) return "completed";
  if (currentDate >= start && currentDate <= endDate) return "traveling";

  const daysUntilStart = Math.ceil(
    (start.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysUntilStart <= 30 && daysUntilStart > 0) return "upcoming";

  return "planning";
};

export const getStatusDisplayText = (status: string): string => {
  switch (status) {
    case "upcoming":
      return "Upcoming";
    case "planning":
      return "Planning";
    case "traveling":
      return "Traveling";
    case "completed":
      return "Trip Completed";
    default:
      return "Planning";
  }
};
