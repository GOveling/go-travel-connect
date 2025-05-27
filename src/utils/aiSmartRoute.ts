
import { Trip, SavedPlace, DayItinerary, OptimizedPlace, RouteConfiguration } from "@/types/aiSmartRoute";

export const getSavedPlacesByDestination = (trip: Trip | null) => {
  if (!trip?.savedPlaces) return {};
  
  const placesByDestination: { [key: string]: SavedPlace[] } = {};
  
  trip.savedPlaces.forEach(place => {
    const destinationName = place.destinationName || trip.destination;
    if (!placesByDestination[destinationName]) {
      placesByDestination[destinationName] = [];
    }
    placesByDestination[destinationName].push(place);
  });
  
  return placesByDestination;
};

export const calculateDestinationDays = (tripDates: string, totalDestinations: number, trip: Trip | null) => {
  try {
    const dateRange = tripDates.split(' - ');
    if (dateRange.length !== 2) return Array(totalDestinations).fill(1);
    
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
    
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const savedPlacesByDestination = getSavedPlacesByDestination(trip);
    
    const destinationDays = [];
    let remainingDays = totalDays;
    
    trip?.coordinates.forEach((destination, index) => {
      const savedPlaces = savedPlacesByDestination[destination.name] || [];
      const isLast = index === totalDestinations - 1;
      
      if (isLast) {
        destinationDays.push(Math.max(1, remainingDays));
      } else {
        const baseDays = Math.max(1, Math.ceil(savedPlaces.length / 3));
        const allocatedDays = Math.min(baseDays, Math.floor(remainingDays / (totalDestinations - index)));
        destinationDays.push(Math.max(1, allocatedDays));
        remainingDays -= allocatedDays;
      }
    });
    
    return destinationDays;
  } catch (error) {
    return Array(totalDestinations).fill(1);
  }
};

export const getDestinationDates = (tripDates: string, destinationIndex: number, totalDestinations: number, allocatedDays: number, trip: Trip | null) => {
  try {
    const dateRange = tripDates.split(' - ');
    if (dateRange.length !== 2) return `Day ${destinationIndex + 1}${allocatedDays > 1 ? `-${destinationIndex + allocatedDays}` : ''}`;
    
    const startDateStr = dateRange[0];
    const endDateStr = dateRange[1];
    
    const year = endDateStr.split(', ')[1] || new Date().getFullYear().toString();
    
    const startMonth = startDateStr.split(' ')[0];
    const startDay = parseInt(startDateStr.split(' ')[1]);
    
    const monthMap: { [key: string]: number } = {
      'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
      'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
    };
    
    const startDate = new Date(parseInt(year), monthMap[startMonth], startDay);
    
    const destinationDays = calculateDestinationDays(tripDates, totalDestinations, trip);
    let dayOffset = 0;
    for (let i = 0; i < destinationIndex; i++) {
      dayOffset += destinationDays[i];
    }
    
    const destStartDate = new Date(startDate);
    destStartDate.setDate(startDate.getDate() + dayOffset);
    
    const destEndDate = new Date(destStartDate);
    destEndDate.setDate(destStartDate.getDate() + allocatedDays - 1);
    
    const formatDate = (date: Date) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date.getMonth()]} ${date.getDate()}`;
    };
    
    if (allocatedDays === 1) {
      return formatDate(destStartDate);
    } else {
      return `${formatDate(destStartDate)} - ${formatDate(destEndDate)}`;
    }
  } catch (error) {
    return `Day ${destinationIndex + 1}${allocatedDays > 1 ? `-${destinationIndex + allocatedDays}` : ''}`;
  }
};

export const convertToOptimizedPlaces = (places: SavedPlace[], routeType: string, destination: { lat: number; lng: number; name: string }) => {
  return places.map((place, index) => ({
    ...place,
    lat: place.lat || destination.lat,
    lng: place.lng || destination.lng,
    destinationName: destination.name,
    aiRecommendedDuration: routeType === 'speed' ? "1 hour" : 
                           routeType === 'leisure' ? (place.estimatedTime.split('-')[1]?.trim() || place.estimatedTime) :
                           place.estimatedTime.split('-')[0].trim(),
    bestTimeToVisit: routeType === 'speed' ? `${8 + (index % 8)}:00 ${index < 8 ? 'AM' : 'PM'}` :
                    routeType === 'leisure' ? (index === 0 ? "10:00 AM" : "3:00 PM") :
                    index === 0 ? "9:00 AM" : index === 1 ? "1:00 PM" : index === 2 ? "4:00 PM" : "6:00 PM",
    orderInRoute: index + 1
  }));
};

export const generateOptimizedRoutes = (trip: Trip | null) => {
  if (!trip) return { current: [], speed: [], leisure: [] };

  const routes = { current: [] as DayItinerary[], speed: [] as DayItinerary[], leisure: [] as DayItinerary[] };
  const destinationDays = calculateDestinationDays(trip.dates, trip.coordinates.length, trip);
  const savedPlacesByDestination = getSavedPlacesByDestination(trip);

  trip.coordinates.forEach((destination, destIndex) => {
    const savedPlaces = savedPlacesByDestination[destination.name] || [];
    const allocatedDays = destinationDays[destIndex];
    
    if (savedPlaces.length === 0) return;

    const destinationDate = getDestinationDates(trip.dates, destIndex, trip.coordinates.length, allocatedDays, trip);

    // Current Route: Balanced approach considering allocated days
    const placesPerDay = Math.ceil(savedPlaces.length / allocatedDays);
    const currentPlaces = savedPlaces
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, Math.min(placesPerDay * allocatedDays, savedPlaces.length));

    if (currentPlaces.length > 0) {
      routes.current.push({
        day: destIndex + 1,
        date: destinationDate,
        destinationName: destination.name,
        places: convertToOptimizedPlaces(currentPlaces, 'current', destination),
        totalTime: `${Math.ceil(currentPlaces.length * 2.5)} hours`,
        walkingTime: `${Math.ceil(currentPlaces.length * 0.5)} minutes`,
        transportTime: `${Math.ceil(currentPlaces.length * 0.3)} minutes`,
        freeTime: `${Math.max(1, allocatedDays - 1)} hours`,
        allocatedDays: allocatedDays
      });
    }

    // Speed Route: Maximum places per day across allocated days
    const speedPlacesPerDay = Math.min(6, Math.ceil(savedPlaces.length / allocatedDays));
    const speedPlaces = savedPlaces
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, speedPlacesPerDay * allocatedDays);

    if (speedPlaces.length > 0) {
      routes.speed.push({
        day: destIndex + 1,
        date: destinationDate,
        destinationName: destination.name,
        places: convertToOptimizedPlaces(speedPlaces, 'speed', destination),
        totalTime: `${speedPlaces.length} hours`,
        walkingTime: `${Math.ceil(speedPlaces.length * 0.7)} minutes`,
        transportTime: `${Math.ceil(speedPlaces.length * 0.5)} minutes`,
        freeTime: "30 minutes",
        allocatedDays: allocatedDays
      });
    }

    // Leisure Route: Fewer places with more time, respecting allocated days
    const leisurePlacesPerDay = Math.max(1, Math.floor(savedPlaces.length / (allocatedDays * 2)));
    const leisurePlaces = savedPlaces
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      })
      .slice(0, leisurePlacesPerDay * allocatedDays);

    if (leisurePlaces.length > 0) {
      routes.leisure.push({
        day: destIndex + 1,
        date: destinationDate,
        destinationName: destination.name,
        places: convertToOptimizedPlaces(leisurePlaces, 'leisure', destination),
        totalTime: `${leisurePlaces.length * 3} hours`,
        walkingTime: "30 minutes",
        transportTime: "20 minutes",
        freeTime: `${allocatedDays * 3} hours`,
        allocatedDays: allocatedDays
      });
    }
  });

  return routes;
};

export const getRouteConfigurations = (trip: Trip | null): { [key: string]: RouteConfiguration } => {
  const routes = generateOptimizedRoutes(trip);
  const totalDays = trip ? calculateDestinationDays(trip.dates, trip.coordinates.length, trip).reduce((a, b) => a + b, 0) : 0;
  
  return {
    current: {
      name: "Current Route",
      description: "Optimal balance considering allocated days per destination",
      duration: `${totalDays} day${totalDays > 1 ? 's' : ''}`,
      efficiency: "92%",
      itinerary: routes.current
    },
    speed: {
      name: "Speed Route",
      description: "Maximum places within allocated timeframe",
      duration: `${totalDays} day${totalDays > 1 ? 's' : ''}`,
      efficiency: "98%",
      itinerary: routes.speed
    },
    leisure: {
      name: "Leisure Route",
      description: "Relaxed pace with more time per location",
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
