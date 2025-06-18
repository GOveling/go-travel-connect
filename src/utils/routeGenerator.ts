
import { Trip, DayItinerary, RouteConfiguration } from "@/types";
import { getDestinationDateRanges, getIndividualDayDates } from "./dateUtils";
import { getSavedPlacesByDestination, convertToOptimizedPlaces, distributePlacesAcrossDays } from "./placeUtils";
import { createSuggestedDayItinerary, createTentativeDestinationItinerary } from "./placeSuggestions";

export const generateOptimizedRoutes = (trip: Trip | null) => {
  if (!trip) return { current: [], speed: [], leisure: [] };

  const routes = { current: [] as DayItinerary[], speed: [] as DayItinerary[], leisure: [] as DayItinerary[] };
  const destinationRanges = getDestinationDateRanges(trip.dates, trip.coordinates.length);
  const savedPlacesByDestination = getSavedPlacesByDestination(trip);

  let dayCounter = 1;

  trip.coordinates.forEach((destination, destIndex) => {
    const savedPlaces = savedPlacesByDestination[destination.name] || [];
    const destinationRange = destinationRanges[destIndex];
    
    if (!destinationRange) return;

    const individualDates = getIndividualDayDates(destinationRange);
    const existingPlaceIds = savedPlaces.map(place => place.id);

    // Check if this destination has saved places
    const hasSavedPlaces = savedPlaces.length > 0;

    if (hasSavedPlaces) {
      // Existing logic for destinations with saved places
      // Current Route: Balanced distribution across allocated days
      const currentSortedPlaces = savedPlaces
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
      
      const currentDayGroups = distributePlacesAcrossDays(currentSortedPlaces, destinationRange.days, 'current');
      
      // Add days with saved places
      currentDayGroups.forEach((dayPlaces, dayIndex) => {
        if (dayPlaces.length > 0) {
          routes.current.push({
            day: dayCounter,
            date: individualDates[dayIndex] || `Day ${dayCounter}`,
            destinationName: destination.name,
            places: convertToOptimizedPlaces(dayPlaces, 'current', destination, 1),
            totalTime: `${Math.ceil(dayPlaces.length * 2.5)} hours`,
            walkingTime: `${Math.ceil(dayPlaces.length * 0.5)} minutes`,
            transportTime: `${Math.ceil(dayPlaces.length * 0.3)} minutes`,
            freeTime: `${Math.max(2, 8 - dayPlaces.length * 2)} hours`,
            allocatedDays: destinationRange.days
          });
        }
        dayCounter++;
      });

      // Add suggested days for unused allocated days
      if (currentDayGroups.length < destinationRange.days) {
        for (let i = currentDayGroups.length; i < destinationRange.days; i++) {
          const suggestedDay = createSuggestedDayItinerary(
            dayCounter,
            individualDates[i] || `Day ${dayCounter}`,
            destination.name,
            destination,
            existingPlaceIds,
            'current'
          );
          routes.current.push(suggestedDay);
          dayCounter++;
        }
      }

      // Similar logic for speed and leisure routes...
      // Reset day counter for other routes
      dayCounter -= destinationRange.days;

      // Speed Route
      const speedSortedPlaces = savedPlaces
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
      
      const speedPlacesPerDay = Math.min(4, Math.ceil(savedPlaces.length / destinationRange.days));
      const speedDayGroups = distributePlacesAcrossDays(speedSortedPlaces.slice(0, speedPlacesPerDay * destinationRange.days), destinationRange.days, 'speed');
      
      speedDayGroups.forEach((dayPlaces, dayIndex) => {
        if (dayPlaces.length > 0) {
          routes.speed.push({
            day: dayCounter,
            date: individualDates[dayIndex] || `Day ${dayCounter}`,
            destinationName: destination.name,
            places: convertToOptimizedPlaces(dayPlaces, 'speed', destination, 1),
            totalTime: `${dayPlaces.length * 1.5} hours`,
            walkingTime: `${Math.ceil(dayPlaces.length * 0.7)} minutes`,
            transportTime: `${Math.ceil(dayPlaces.length * 0.5)} minutes`,
            freeTime: `${Math.max(1, 6 - dayPlaces.length * 1.5)} hours`,
            allocatedDays: destinationRange.days
          });
        }
        dayCounter++;
      });

      // Add suggested days for speed route
      if (speedDayGroups.length < destinationRange.days) {
        for (let i = speedDayGroups.length; i < destinationRange.days; i++) {
          const suggestedDay = createSuggestedDayItinerary(
            dayCounter,
            individualDates[i] || `Day ${dayCounter}`,
            destination.name,
            destination,
            existingPlaceIds,
            'speed'
          );
          routes.speed.push(suggestedDay);
          dayCounter++;
        }
      }

      // Reset day counter for leisure route
      dayCounter -= destinationRange.days;

      // Leisure Route
      const leisureSortedPlaces = savedPlaces
        .sort((a, b) => {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
      
      const leisurePlacesPerDay = Math.max(1, Math.floor(savedPlaces.length / destinationRange.days));
      const leisureDayGroups = distributePlacesAcrossDays(leisureSortedPlaces.slice(0, leisurePlacesPerDay * destinationRange.days), destinationRange.days, 'leisure');
      
      leisureDayGroups.forEach((dayPlaces, dayIndex) => {
        if (dayPlaces.length > 0) {
          routes.leisure.push({
            day: dayCounter,
            date: individualDates[dayIndex] || `Day ${dayCounter}`,
            destinationName: destination.name,
            places: convertToOptimizedPlaces(dayPlaces, 'leisure', destination, 1),
            totalTime: `${dayPlaces.length * 3} hours`,
            walkingTime: "30 minutes",
            transportTime: "20 minutes",
            freeTime: `${Math.max(4, 10 - dayPlaces.length * 3)} hours`,
            allocatedDays: destinationRange.days
          });
        }
        dayCounter++;
      });

      // Add suggested days for leisure route
      if (leisureDayGroups.length < destinationRange.days) {
        for (let i = leisureDayGroups.length; i < destinationRange.days; i++) {
          const suggestedDay = createSuggestedDayItinerary(
            dayCounter,
            individualDates[i] || `Day ${dayCounter}`,
            destination.name,
            destination,
            existingPlaceIds,
            'leisure'
          );
          routes.leisure.push(suggestedDay);
          dayCounter++;
        }
      }

      // Reset day counter for next destination
      dayCounter -= destinationRange.days;
      dayCounter += destinationRange.days;
    } else {
      // NEW LOGIC: Generate tentative itinerary for destinations without saved places
      for (let dayIndex = 0; dayIndex < destinationRange.days; dayIndex++) {
        const currentDate = individualDates[dayIndex] || `Day ${dayCounter}`;
        
        // Generate tentative itinerary for current route
        const tentativeCurrentDay = createTentativeDestinationItinerary(
          dayCounter,
          currentDate,
          destination.name,
          destination,
          'current',
          dayIndex,
          destinationRange.days
        );
        routes.current.push(tentativeCurrentDay);

        // Generate tentative itinerary for speed route
        const tentativeSpeedDay = createTentativeDestinationItinerary(
          dayCounter,
          currentDate,
          destination.name,
          destination,
          'speed',
          dayIndex,
          destinationRange.days
        );
        routes.speed.push(tentativeSpeedDay);

        // Generate tentative itinerary for leisure route
        const tentativeLeisureDay = createTentativeDestinationItinerary(
          dayCounter,
          currentDate,
          destination.name,
          destination,
          'leisure',
          dayIndex,
          destinationRange.days
        );
        routes.leisure.push(tentativeLeisureDay);

        dayCounter++;
      }
    }
  });

  return routes;
};

export const getRouteConfigurations = (trip: Trip | null): { [key: string]: RouteConfiguration } => {
  const routes = generateOptimizedRoutes(trip);
  const destinationRanges = trip ? getDestinationDateRanges(trip.dates, trip.coordinates.length) : [];
  const totalDays = destinationRanges.reduce((total, range) => total + range.days, 0);
  
  return {
    current: {
      name: "Current Route",
      description: "Balanced itinerary using exact dates from View Details",
      duration: `${totalDays} day${totalDays > 1 ? 's' : ''}`,
      efficiency: "92%",
      itinerary: routes.current
    },
    speed: {
      name: "Speed Route",
      description: "Maximum places within your allocated timeframe",
      duration: `${totalDays} day${totalDays > 1 ? 's' : ''}`,
      efficiency: "98%",
      itinerary: routes.speed
    },
    leisure: {
      name: "Leisure Route",
      description: "Relaxed pace with your exact trip dates",
      duration: `${totalDays} day${totalDays > 1 ? 's' : ''}`,
      efficiency: "78%",
      itinerary: routes.leisure
    }
  };
};
