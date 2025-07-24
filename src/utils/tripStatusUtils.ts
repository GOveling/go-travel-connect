export const calculateTripStatus = (tripDates: string): string => {
  if (!tripDates || tripDates.trim() === "") {
    return "planning";
  }

  try {
    // Parse the trip dates (format: "Dec 15 - Dec 25, 2024" or "Jan 8 - Jan 15, 2025")
    const dateRange = tripDates.split(" - ");
    if (dateRange.length !== 2) {
      return "planning";
    }

    const startDateStr = dateRange[0].trim();
    const endDateStr = dateRange[1].trim();

    // Extract year from end date
    const year =
      endDateStr.split(", ")[1] || new Date().getFullYear().toString();

    // Parse start date
    const startParts = startDateStr.split(" ");
    const startMonth = startParts[0];
    const startDay = parseInt(startParts[1]);

    // Parse end date
    const endParts = endDateStr.split(" ");
    const endMonth = endParts[0];
    const endDay = parseInt(endParts[1].split(",")[0]);

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

    const startDate = new Date(parseInt(year), monthMap[startMonth], startDay);
    const endDate = new Date(parseInt(year), monthMap[endMonth], endDay);
    const currentDate = new Date();

    // Reset time to compare only dates
    currentDate.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(0, 0, 0, 0);

    // Calculate days until trip starts
    const daysUntilStart = Math.ceil(
      (startDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Determine status based on dates
    if (currentDate > endDate) {
      return "completed"; // Trip is finished
    } else if (currentDate >= startDate && currentDate <= endDate) {
      return "traveling"; // Currently on the trip
    } else if (daysUntilStart <= 30 && daysUntilStart > 0) {
      return "upcoming"; // Trip starts within 30 days
    } else {
      return "planning"; // Trip is more than 30 days away or no valid dates
    }
  } catch (error) {
    return "planning"; // Default to planning if date parsing fails
  }
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
