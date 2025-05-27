
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

// Extract destination dates from the existing itinerary display logic (from TripDetailModal)
export const extractDestinationDateFromItinerary = (tripDates: string, destinationIndex: number, totalDestinations: number) => {
  try {
    const dateRange = tripDates.split(' - ');
    if (dateRange.length !== 2) return { startDate: new Date(), endDate: new Date(), days: 1 };
    
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
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const daysPerDestination = Math.ceil(totalDays / totalDestinations);
    
    // Calculate destination start and end dates
    const destStartDate = new Date(startDate);
    destStartDate.setDate(startDate.getDate() + (destinationIndex * daysPerDestination));
    
    const destEndDate = new Date(destStartDate);
    destEndDate.setDate(destStartDate.getDate() + daysPerDestination - 1);
    
    return {
      startDate: destStartDate,
      endDate: destEndDate,
      days: daysPerDestination
    };
  } catch (error) {
    return { startDate: new Date(), endDate: new Date(), days: 1 };
  }
};

export const calculateDestinationDays = (tripDates: string, totalDestinations: number, trip: Trip | null) => {
  const destinationDays = [];
  
  for (let i = 0; i < totalDestinations; i++) {
    const dateInfo = extractDestinationDateFromItinerary(tripDates, i, totalDestinations);
    destinationDays.push(dateInfo.days);
  }
  
  return destinationDays;
};

export const getDestinationDates = (tripDates: string, destinationIndex: number, totalDestinations: number, allocatedDays: number, trip: Trip | null) => {
  try {
    const dateInfo = extractDestinationDateFromItinerary(tripDates, destinationIndex, totalDestinations);
    
    const formatDate = (date: Date) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${months[date.getMonth()]} ${date.getDate()}`;
    };
    
    if (dateInfo.days === 1) {
      return formatDate(dateInfo.startDate);
    } else {
      return `${formatDate(dateInfo.startDate)} - ${formatDate(dateInfo.endDate)}`;
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

    // Current Route: Balanced approach using extracted days from itinerary
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

    // Speed Route: Maximum places per day using extracted days
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

    // Leisure Route: Fewer places with more time, using extracted days
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
      description: "Optimal balance using dates from View Details itinerary",
      duration: `${totalDays} day${totalDays > 1 ? 's' : ''}`,
      efficiency: "92%",
      itinerary: routes.current
    },
    speed: {
      name: "Speed Route",
      description: "Maximum places using itinerary timeframe",
      duration: `${totalDays} day${totalDays > 1 ? 's' : ''}`,
      efficiency: "98%",
      itinerary: routes.speed
    },
    leisure: {
      name: "Leisure Route",
      description: "Relaxed pace based on itinerary dates",
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
