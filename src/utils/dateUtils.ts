
// Enhanced function to extract exact date ranges for each destination from the itinerary display
export const getDestinationDateRanges = (tripDates: string, totalDestinations: number) => {
  const destinationRanges: Array<{ startDate: Date; endDate: Date; days: number; dateString: string }> = [];
  
  try {
    const dateRange = tripDates.split(' - ');
    if (dateRange.length !== 2) {
      // Fallback to equal distribution
      for (let i = 0; i < totalDestinations; i++) {
        destinationRanges.push({
          startDate: new Date(),
          endDate: new Date(),
          days: 1,
          dateString: `Day ${i + 1}`
        });
      }
      return destinationRanges;
    }
    
    const startDateStr = dateRange[0];
    const endDateStr = dateRange[1];
    
    const year = endDateStr.split(', ')[1] || new Date().getFullYear().toString();
    
    const startMonth = startDateStr.split(' ')[0];
    const startDay = parseInt(startDateStr.split(' ')[1]);
    
    const endMonth = endDateStr.split(' ')[0];
    const endDay = parseInt(endDateStr.split(' ')[1].split(',')[0]);
    
    const monthMap: { [key: string]: number } = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    
    const startDate = new Date(parseInt(year), monthMap[startMonth], startDay);
    const endDate = new Date(parseInt(year), monthMap[endMonth], endDay);
    
    // Fix: Calculate total days correctly (inclusive of both start and end dates)
    const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const baseDaysPerDestination = Math.floor(totalDays / totalDestinations);
    const extraDays = totalDays % totalDestinations;
    
    let currentDate = new Date(startDate);
    
    for (let i = 0; i < totalDestinations; i++) {
      const daysForThisDestination = baseDaysPerDestination + (i < extraDays ? 1 : 0);
      const destStartDate = new Date(currentDate);
      const destEndDate = new Date(currentDate);
      destEndDate.setDate(destStartDate.getDate() + daysForThisDestination - 1);
      
      const formatDate = (date: Date) => {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}`;
      };
      
      const dateString = daysForThisDestination === 1 ? 
        formatDate(destStartDate) : 
        `${formatDate(destStartDate)} - ${formatDate(destEndDate)}`;
      
      destinationRanges.push({
        startDate: destStartDate,
        endDate: destEndDate,
        days: daysForThisDestination,
        dateString: dateString
      });
      
      // Move to next destination's start date (day after current destination ends)
      currentDate.setDate(destEndDate.getDate() + 1);
    }
    
  } catch (error) {
    // Fallback to equal distribution if parsing fails
    for (let i = 0; i < totalDestinations; i++) {
      destinationRanges.push({
        startDate: new Date(),
        endDate: new Date(),
        days: 1,
        dateString: `Day ${i + 1}`
      });
    }
  }
  
  return destinationRanges;
};

// Helper function to generate individual day dates
export const getIndividualDayDates = (destinationRange: { startDate: Date; endDate: Date; days: number; dateString: string }) => {
  const dates: string[] = [];
  const currentDate = new Date(destinationRange.startDate);
  
  for (let i = 0; i < destinationRange.days; i++) {
    const formatDate = (date: Date) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date.getMonth()]} ${date.getDate()}`;
    };
    
    dates.push(formatDate(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
};

// Legacy functions for backward compatibility
export const extractDestinationDateFromItinerary = (tripDates: string, destinationIndex: number, totalDestinations: number) => {
  const ranges = getDestinationDateRanges(tripDates, totalDestinations);
  const range = ranges[destinationIndex];
  return range ? {
    startDate: range.startDate,
    endDate: range.endDate,
    days: range.days
  } : { startDate: new Date(), endDate: new Date(), days: 1 };
};

export const calculateDestinationDays = (tripDates: string, totalDestinations: number, trip: any) => {
  const ranges = getDestinationDateRanges(tripDates, totalDestinations);
  return ranges.map(range => range.days);
};

export const getDestinationDates = (tripDates: string, destinationIndex: number, totalDestinations: number, allocatedDays: number, trip: any) => {
  const ranges = getDestinationDateRanges(tripDates, totalDestinations);
  const range = ranges[destinationIndex];
  return range ? range.dateString : `Day ${destinationIndex + 1}`;
};
