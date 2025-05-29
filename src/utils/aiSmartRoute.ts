import { Trip, SavedPlace, DayItinerary, OptimizedPlace, RouteConfiguration } from "@/types/aiSmartRoute";

// Mock saved places data that matches TripDetailModal structure
const savedPlacesByDestination = {
  "Paris": [
    {
      id: "1",
      name: "Eiffel Tower",
      category: "Landmark",
      rating: 4.8,
      image: "🗼",
      description: "Iconic iron tower and symbol of Paris",
      estimatedTime: "2-3 hours",
      priority: "high" as const,
      destinationName: "Paris"
    },
    {
      id: "2",
      name: "Louvre Museum",
      category: "Museum",
      rating: 4.7,
      image: "🎨",
      description: "World's largest art museum",
      estimatedTime: "4-6 hours",
      priority: "high" as const,
      destinationName: "Paris"
    },
    {
      id: "3",
      name: "Café de Flore",
      category: "Restaurant",
      rating: 4.3,
      image: "☕",
      description: "Historic café in Saint-Germain",
      estimatedTime: "1-2 hours",
      priority: "medium" as const,
      destinationName: "Paris"
    }
  ],
  "Rome": [
    {
      id: "4",
      name: "Colosseum",
      category: "Landmark",
      rating: 4.9,
      image: "🏛️",
      description: "Ancient Roman amphitheater",
      estimatedTime: "2-3 hours",
      priority: "high" as const,
      destinationName: "Rome"
    },
    {
      id: "5",
      name: "Vatican Museums",
      category: "Museum",
      rating: 4.8,
      image: "🎨",
      description: "Pope's art collection and Sistine Chapel",
      estimatedTime: "3-4 hours",
      priority: "high" as const,
      destinationName: "Rome"
    },
    {
      id: "6",
      name: "Trevi Fountain",
      category: "Landmark",
      rating: 4.6,
      image: "⛲",
      description: "Famous baroque fountain",
      estimatedTime: "30 minutes",
      priority: "medium" as const,
      destinationName: "Rome"
    }
  ],
  "Barcelona": [
    {
      id: "7",
      name: "Sagrada Familia",
      category: "Landmark",
      rating: 4.9,
      image: "⛪",
      description: "Gaudí's masterpiece basilica",
      estimatedTime: "2-3 hours",
      priority: "high" as const,
      destinationName: "Barcelona"
    },
    {
      id: "8",
      name: "Park Güell",
      category: "Park",
      rating: 4.7,
      image: "🌳",
      description: "Colorful mosaic park by Gaudí",
      estimatedTime: "2-3 hours",
      priority: "high" as const,
      destinationName: "Barcelona"
    },
    {
      id: "9",
      name: "La Boqueria Market",
      category: "Market",
      rating: 4.4,
      image: "🍅",
      description: "Famous food market on Las Ramblas",
      estimatedTime: "1-2 hours",
      priority: "medium" as const,
      destinationName: "Barcelona"
    }
  ],
  "Tokyo": [
    {
      id: "10",
      name: "Senso-ji Temple",
      category: "Temple",
      rating: 4.6,
      image: "⛩️",
      description: "Tokyo's oldest Buddhist temple",
      estimatedTime: "1-2 hours",
      priority: "high" as const,
      destinationName: "Tokyo"
    },
    {
      id: "11",
      name: "Shibuya Crossing",
      category: "Landmark",
      rating: 4.5,
      image: "🚦",
      description: "World's busiest pedestrian crossing",
      estimatedTime: "30 minutes",
      priority: "medium" as const,
      destinationName: "Tokyo"
    }
  ],
  "Bali": [
    {
      id: "12",
      name: "Tanah Lot Temple",
      category: "Temple",
      rating: 4.5,
      image: "🏛️",
      description: "Temple on a rock formation in the sea",
      estimatedTime: "2 hours",
      priority: "high" as const,
      destinationName: "Bali"
    },
    {
      id: "13",
      name: "Rice Terraces of Jatiluwih",
      category: "Nature",
      rating: 4.7,
      image: "🌾",
      description: "UNESCO World Heritage rice terraces",
      estimatedTime: "3-4 hours",
      priority: "high" as const,
      destinationName: "Bali"
    }
  ]
};

export const getSavedPlacesByDestination = (trip: Trip | null) => {
  if (!trip) return {};
  
  const placesByDestination: { [key: string]: SavedPlace[] } = {};
  
  // First, check if trip has savedPlacesByDestination property
  if (trip.savedPlacesByDestination) {
    Object.keys(trip.savedPlacesByDestination).forEach(destinationName => {
      placesByDestination[destinationName] = trip.savedPlacesByDestination![destinationName];
    });
  }
  
  // Then, check trip.savedPlaces and organize by destination
  if (trip.savedPlaces) {
    trip.savedPlaces.forEach(place => {
      const destinationName = place.destinationName || trip.destination;
      if (!placesByDestination[destinationName]) {
        placesByDestination[destinationName] = [];
      }
      placesByDestination[destinationName].push(place);
    });
  }
  
  // Finally, fall back to mock data for destinations that have saved places in the system
  trip.coordinates.forEach(coordinate => {
    if (!placesByDestination[coordinate.name] || placesByDestination[coordinate.name].length === 0) {
      const mockPlaces = savedPlacesByDestination[coordinate.name as keyof typeof savedPlacesByDestination];
      if (mockPlaces) {
        placesByDestination[coordinate.name] = mockPlaces;
      }
    }
  });
  
  return placesByDestination;
};

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
    
    // Calculate total trip days
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
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
      
      // Move to next destination's start date
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

export const convertToOptimizedPlaces = (places: SavedPlace[], routeType: string, destination: { lat: number; lng: number; name: string }, allocatedDays: number) => {
  return places.map((place, index) => ({
    ...place,
    lat: place.lat || destination.lat,
    lng: place.lng || destination.lng,
    destinationName: destination.name,
    aiRecommendedDuration: routeType === 'speed' ? "1 hour" : 
                           routeType === 'leisure' ? (place.estimatedTime.split('-')[1]?.trim() || place.estimatedTime) :
                           place.estimatedTime.split('-')[0]?.trim() || place.estimatedTime,
    bestTimeToVisit: routeType === 'speed' ? `${9 + (index * 2)}:00 ${index * 2 < 4 ? 'AM' : 'PM'}` :
                    routeType === 'leisure' ? (index === 0 ? "10:00 AM" : index === 1 ? "3:00 PM" : "6:00 PM") :
                    index === 0 ? "9:00 AM" : index === 1 ? "1:00 PM" : index === 2 ? "4:00 PM" : "6:00 PM",
    orderInRoute: index + 1
  }));
};

// Helper function to distribute places across multiple days
const distributePlacesAcrossDays = (places: SavedPlace[], allocatedDays: number, routeType: string) => {
  if (allocatedDays === 1) {
    return [places];
  }
  
  const placesPerDay = Math.ceil(places.length / allocatedDays);
  const dayGroups: SavedPlace[][] = [];
  
  for (let day = 0; day < allocatedDays; day++) {
    const startIndex = day * placesPerDay;
    const endIndex = Math.min(startIndex + placesPerDay, places.length);
    const dayPlaces = places.slice(startIndex, endIndex);
    
    if (dayPlaces.length > 0) {
      dayGroups.push(dayPlaces);
    }
  }
  
  return dayGroups;
};

// Helper function to generate individual day dates
const getIndividualDayDates = (destinationRange: { startDate: Date; endDate: Date; days: number; dateString: string }) => {
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

export const generateOptimizedRoutes = (trip: Trip | null) => {
  if (!trip) return { current: [], speed: [], leisure: [] };

  const routes = { current: [] as DayItinerary[], speed: [] as DayItinerary[], leisure: [] as DayItinerary[] };
  const destinationRanges = getDestinationDateRanges(trip.dates, trip.coordinates.length);
  const savedPlacesByDestination = getSavedPlacesByDestination(trip);

  let dayCounter = 1;

  trip.coordinates.forEach((destination, destIndex) => {
    const savedPlaces = savedPlacesByDestination[destination.name] || [];
    const destinationRange = destinationRanges[destIndex];
    
    if (savedPlaces.length === 0 || !destinationRange) return;

    const individualDates = getIndividualDayDates(destinationRange);

    // Current Route: Balanced distribution across allocated days
    const currentSortedPlaces = savedPlaces
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    
    const currentDayGroups = distributePlacesAcrossDays(currentSortedPlaces, destinationRange.days, 'current');
    
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
        dayCounter++;
      }
    });

    // Reset day counter for other routes
    dayCounter -= currentDayGroups.length;

    // Speed Route: More places per day, optimized for efficiency
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
        dayCounter++;
      }
    });

    // Reset day counter for leisure route
    dayCounter -= speedDayGroups.length;

    // Leisure Route: Fewer places per day, more relaxed pace
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
        dayCounter++;
      }
    });

    // Reset day counter for next destination
    dayCounter -= leisureDayGroups.length;
    dayCounter += destinationRange.days;
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

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800";
    case "medium":
      return "bg-yellow-100 text-yellow-800";
    case "low":
      return "bg-gray-100 text-gray-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// Legacy functions for backward compatibility - kept but now use the new logic
export const extractDestinationDateFromItinerary = (tripDates: string, destinationIndex: number, totalDestinations: number) => {
  const ranges = getDestinationDateRanges(tripDates, totalDestinations);
  const range = ranges[destinationIndex];
  return range ? {
    startDate: range.startDate,
    endDate: range.endDate,
    days: range.days
  } : { startDate: new Date(), endDate: new Date(), days: 1 };
};

export const calculateDestinationDays = (tripDates: string, totalDestinations: number, trip: Trip | null) => {
  const ranges = getDestinationDateRanges(tripDates, totalDestinations);
  return ranges.map(range => range.days);
};

export const getDestinationDates = (tripDates: string, destinationIndex: number, totalDestinations: number, allocatedDays: number, trip: Trip | null) => {
  const ranges = getDestinationDateRanges(tripDates, totalDestinations);
  const range = ranges[destinationIndex];
  return range ? range.dateString : `Day ${destinationIndex + 1}`;
};
