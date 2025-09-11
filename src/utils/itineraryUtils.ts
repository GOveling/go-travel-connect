import { DayItinerary } from "@/types";
import { addDays, differenceInDays, format, parseISO } from "date-fns";
import { createSuggestedDayItinerary, createTentativeDestinationItinerary } from "./placeSuggestions";

export interface FilledItineraryOptions {
  startDate: string;
  endDate: string;
  destinationName: string;
  destination: { lat: number; lng: number; name: string };
  existingPlaceIds: string[];
  routeType: string;
}

export const fillMissingDays = (
  apiItinerary: DayItinerary[],
  options: FilledItineraryOptions
): DayItinerary[] => {
  const { startDate, endDate, destinationName, destination, existingPlaceIds, routeType } = options;
  
  try {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const totalDays = differenceInDays(end, start) + 1;
    
    const filledItinerary: DayItinerary[] = [];
    
    // Create a map of existing days from API response
    const apiDayMap = new Map<string, DayItinerary>();
    apiItinerary.forEach(day => {
      apiDayMap.set(day.date, day);
    });
    
    // Generate all days in the date range
    for (let i = 0; i < totalDays; i++) {
      const currentDate = addDays(start, i);
      const dateString = format(currentDate, 'yyyy-MM-dd');
      
      if (apiDayMap.has(dateString)) {
        // Use existing day from API
        const apiDay = apiDayMap.get(dateString)!;
        filledItinerary.push({
          ...apiDay,
          day: i + 1, // Ensure sequential day numbers
        });
      } else {
        // Create suggested day for missing dates
        const suggestedDay = createSuggestedDayItinerary(
          i + 1,
          dateString,
          destinationName,
          destination,
          existingPlaceIds,
          routeType
        );
        
        // Mark as locally suggested
        filledItinerary.push({
          ...suggestedDay,
          isSuggested: true,
          isTentative: true,
        });
      }
    }
    
    return filledItinerary;
  } catch (error) {
    console.error("Error filling missing days:", error);
    // Return original itinerary if date parsing fails
    return apiItinerary;
  }
};

export const generateMissingDaysForMultipleDestinations = (
  apiItinerary: DayItinerary[],
  trip: any
): DayItinerary[] => {
  if (!trip.startDate || !trip.endDate) {
    return apiItinerary;
  }
  
  const startDate = trip.startDate.toISOString().split('T')[0];
  const endDate = trip.endDate.toISOString().split('T')[0];
  const destinations = trip.destinations || [{ name: trip.destination, lat: 0, lng: 0 }];
  const existingPlaceIds = trip.savedPlaces?.map((p: any) => p.id) || [];
  
  // For multiple destinations, distribute days evenly
  if (destinations.length > 1) {
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    const totalDays = differenceInDays(end, start) + 1;
    const daysPerDestination = Math.ceil(totalDays / destinations.length);
    
    const filledItinerary: DayItinerary[] = [];
    let currentDayIndex = 0;
    
    destinations.forEach((destination: any, destIndex: number) => {
      const destStartDay = destIndex * daysPerDestination;
      const destEndDay = Math.min(destStartDay + daysPerDestination, totalDays);
      
      for (let dayOffset = 0; dayOffset < (destEndDay - destStartDay); dayOffset++) {
        const dayNumber = destStartDay + dayOffset + 1;
        const currentDate = addDays(start, destStartDay + dayOffset);
        const dateString = format(currentDate, 'yyyy-MM-dd');
        
        // Check if API provided this day
        const apiDay = apiItinerary.find(day => day.date === dateString);
        
        if (apiDay) {
          filledItinerary.push({
            ...apiDay,
            day: dayNumber,
            destinationName: destination.name,
          });
        } else {
          // Create tentative day for this destination
          const tentativeDay = createTentativeDestinationItinerary(
            dayNumber,
            dateString,
            destination.name,
            destination,
            'balanced',
            dayOffset,
            destEndDay - destStartDay
          );
          
          filledItinerary.push({
            ...tentativeDay,
            isTentative: true,
            destinationName: destination.name,
          });
        }
      }
    });
    
    return filledItinerary;
  }
  
  // Single destination - use simple fill logic
  return fillMissingDays(apiItinerary, {
    startDate,
    endDate,
    destinationName: trip.destination,
    destination: { lat: 0, lng: 0, name: trip.destination },
    existingPlaceIds,
    routeType: 'balanced',
  });
};