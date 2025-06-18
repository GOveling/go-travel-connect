
import { SavedPlace, DayItinerary, OptimizedPlace } from "@/types";

// Popular places database organized by destination
const popularPlacesByDestination: { [key: string]: SavedPlace[] } = {
  "Paris": [
    {
      id: "suggest-paris-1",
      name: "Notre-Dame Cathedral",
      category: "Landmark",
      rating: 4.6,
      image: "⛪",
      description: "Gothic cathedral with stunning architecture",
      estimatedTime: "1-2 hours",
      priority: "medium" as const,
      destinationName: "Paris"
    },
    {
      id: "suggest-paris-2",
      name: "Montmartre District",
      category: "Neighborhood",
      rating: 4.5,
      image: "🏔️",
      description: "Artistic district with panoramic city views",
      estimatedTime: "2-3 hours",
      priority: "medium" as const,
      destinationName: "Paris"
    },
    {
      id: "suggest-paris-3",
      name: "Seine River Cruise",
      category: "Activity",
      rating: 4.4,
      image: "🚢",
      description: "Scenic boat tour along the Seine",
      estimatedTime: "1-2 hours",
      priority: "low" as const,
      destinationName: "Paris"
    }
  ],
  "Rome": [
    {
      id: "suggest-rome-1",
      name: "Pantheon",
      category: "Landmark",
      rating: 4.7,
      image: "🏛️",
      description: "Ancient Roman temple with impressive dome",
      estimatedTime: "1 hour",
      priority: "medium" as const,
      destinationName: "Rome"
    },
    {
      id: "suggest-rome-2",
      name: "Spanish Steps",
      category: "Landmark",
      rating: 4.3,
      image: "🪜",
      description: "Famous baroque stairway with great views",
      estimatedTime: "30 minutes",
      priority: "low" as const,
      destinationName: "Rome"
    },
    {
      id: "suggest-rome-3",
      name: "Trastevere District",
      category: "Neighborhood",
      rating: 4.5,
      image: "🏘️",
      description: "Charming neighborhood with local restaurants",
      estimatedTime: "2-3 hours",
      priority: "medium" as const,
      destinationName: "Rome"
    }
  ],
  "Barcelona": [
    {
      id: "suggest-barcelona-1",
      name: "Casa Batlló",
      category: "Architecture",
      rating: 4.6,
      image: "🏠",
      description: "Gaudí's colorful modernist masterpiece",
      estimatedTime: "1-2 hours",
      priority: "medium" as const,
      destinationName: "Barcelona"
    },
    {
      id: "suggest-barcelona-2",
      name: "Barceloneta Beach",
      category: "Beach",
      rating: 4.2,
      image: "🏖️",
      description: "Popular city beach with restaurants",
      estimatedTime: "2-4 hours",
      priority: "low" as const,
      destinationName: "Barcelona"
    }
  ],
  "Tokyo": [
    {
      id: "suggest-tokyo-1",
      name: "Meiji Shrine",
      category: "Temple",
      rating: 4.5,
      image: "⛩️",
      description: "Peaceful Shinto shrine in the city",
      estimatedTime: "1-2 hours",
      priority: "medium" as const,
      destinationName: "Tokyo"
    },
    {
      id: "suggest-tokyo-2",
      name: "Tsukiji Outer Market",
      category: "Market",
      rating: 4.4,
      image: "🐟",
      description: "Famous fish market and street food",
      estimatedTime: "2-3 hours",
      priority: "medium" as const,
      destinationName: "Tokyo"
    }
  ],
  "Bali": [
    {
      id: "suggest-bali-1",
      name: "Uluwatu Temple",
      category: "Temple",
      rating: 4.6,
      image: "🏛️",
      description: "Clifftop temple with ocean views",
      estimatedTime: "2 hours",
      priority: "medium" as const,
      destinationName: "Bali"
    },
    {
      id: "suggest-bali-2",
      name: "Ubud Monkey Forest",
      category: "Nature",
      rating: 4.3,
      image: "🐒",
      description: "Sacred forest sanctuary with playful monkeys",
      estimatedTime: "1-2 hours",
      priority: "low" as const,
      destinationName: "Bali"
    }
  ]
};

// Generic destination activities for destinations not in our database
const getGenericDestinationActivities = (destinationName: string): SavedPlace[] => {
  const baseId = `generic-${destinationName.toLowerCase().replace(/\s+/g, '-')}`;
  
  return [
    {
      id: `${baseId}-1`,
      name: `Historic Center of ${destinationName}`,
      category: "Historic District",
      rating: 4.3,
      image: "🏛️",
      description: `Explore the historic heart of ${destinationName} with its architecture and cultural sites`,
      estimatedTime: "2-3 hours",
      priority: "high" as const,
      destinationName: destinationName
    },
    {
      id: `${baseId}-2`,
      name: `Local Market Tour`,
      category: "Market",
      rating: 4.1,
      image: "🛒",
      description: `Experience local culture and cuisine at ${destinationName}'s traditional markets`,
      estimatedTime: "1-2 hours",
      priority: "medium" as const,
      destinationName: destinationName
    },
    {
      id: `${baseId}-3`,
      name: `City Walking Tour`,
      category: "Walking Tour",
      rating: 4.4,
      image: "🚶",
      description: `Guided walking tour to discover the main attractions of ${destinationName}`,
      estimatedTime: "2-3 hours",
      priority: "medium" as const,
      destinationName: destinationName
    },
    {
      id: `${baseId}-4`,
      name: `Local Restaurant Experience`,
      category: "Dining",
      rating: 4.2,
      image: "🍽️",
      description: `Taste authentic local cuisine at recommended restaurants in ${destinationName}`,
      estimatedTime: "1-2 hours",
      priority: "low" as const,
      destinationName: destinationName
    },
    {
      id: `${baseId}-5`,
      name: `Cultural Museum Visit`,
      category: "Museum",
      rating: 4.0,
      image: "🎨",
      description: `Learn about the history and culture of ${destinationName} at local museums`,
      estimatedTime: "2 hours",
      priority: "medium" as const,
      destinationName: destinationName
    },
    {
      id: `${baseId}-6`,
      name: `Scenic Viewpoint`,
      category: "Viewpoint",
      rating: 4.5,
      image: "🌄",
      description: `Visit the best viewpoints for panoramic views of ${destinationName}`,
      estimatedTime: "1 hour",
      priority: "low" as const,
      destinationName: destinationName
    }
  ];
};

export const getSuggestedPlaces = (destinationName: string, existingPlaceIds: string[]): SavedPlace[] => {
  const availablePlaces = popularPlacesByDestination[destinationName] || getGenericDestinationActivities(destinationName);
  
  // Filter out places that are already in the user's saved places
  return availablePlaces.filter(place => !existingPlaceIds.includes(place.id));
};

export const createSuggestedDayItinerary = (
  dayNumber: number,
  date: string,
  destinationName: string,
  destination: { lat: number; lng: number; name: string },
  existingPlaceIds: string[],
  routeType: string
): DayItinerary => {
  const suggestedPlaces = getSuggestedPlaces(destinationName, existingPlaceIds);
  
  // Select 1-2 suggested places based on route type
  const placesToAdd = routeType === 'leisure' ? 
    suggestedPlaces.slice(0, 1) : 
    suggestedPlaces.slice(0, 2);
  
  const optimizedPlaces: OptimizedPlace[] = placesToAdd.map((place, index) => ({
    ...place,
    lat: place.lat || destination.lat,
    lng: place.lng || destination.lng,
    destinationName: destination.name,
    aiRecommendedDuration: routeType === 'speed' ? "1 hour" : 
                           routeType === 'leisure' ? (place.estimatedTime.split('-')[1]?.trim() || place.estimatedTime) :
                           place.estimatedTime.split('-')[0]?.trim() || place.estimatedTime,
    bestTimeToVisit: routeType === 'speed' ? `${10 + (index * 3)}:00 ${index === 0 ? 'AM' : 'PM'}` :
                    routeType === 'leisure' ? "11:00 AM" :
                    index === 0 ? "10:00 AM" : "2:00 PM",
    orderInRoute: index + 1
  }));
  
  return {
    day: dayNumber,
    date: date,
    destinationName: destinationName,
    places: optimizedPlaces,
    totalTime: `${optimizedPlaces.length * 1.5} hours`,
    walkingTime: "20 minutes",
    transportTime: "15 minutes",
    freeTime: `${Math.max(4, 8 - optimizedPlaces.length * 1.5)} hours`,
    allocatedDays: 1,
    isSuggested: true
  };
};

// NEW FUNCTION: Create tentative itinerary for destinations without saved places
export const createTentativeDestinationItinerary = (
  dayNumber: number,
  date: string,
  destinationName: string,
  destination: { lat: number; lng: number; name: string },
  routeType: string,
  dayIndex: number,
  totalDays: number
): DayItinerary => {
  const allActivities = getSuggestedPlaces(destinationName, []);
  
  // Create a more comprehensive itinerary for destinations without saved places
  let selectedActivities: SavedPlace[] = [];
  
  if (routeType === 'speed') {
    // Speed route: 3-4 activities per day, prioritize high-impact places
    const highPriorityPlaces = allActivities.filter(place => place.priority === 'high');
    const mediumPriorityPlaces = allActivities.filter(place => place.priority === 'medium');
    selectedActivities = [
      ...highPriorityPlaces.slice(dayIndex * 2, (dayIndex * 2) + 2),
      ...mediumPriorityPlaces.slice(dayIndex, dayIndex + 2)
    ].slice(0, 4);
  } else if (routeType === 'leisure') {
    // Leisure route: 2-3 activities per day, more relaxed
    selectedActivities = allActivities.slice(dayIndex * 2, (dayIndex * 2) + 2);
  } else {
    // Current route: 2-3 activities per day, balanced approach
    selectedActivities = allActivities.slice(dayIndex * 3, (dayIndex * 3) + 3);
  }

  const optimizedPlaces: OptimizedPlace[] = selectedActivities.map((place, index) => ({
    ...place,
    lat: place.lat || destination.lat,
    lng: place.lng || destination.lng,
    destinationName: destination.name,
    aiRecommendedDuration: routeType === 'speed' ? "1-2 hours" : 
                           routeType === 'leisure' ? "2-3 hours" :
                           place.estimatedTime,
    bestTimeToVisit: routeType === 'speed' ? `${9 + (index * 2)}:00 AM` :
                    routeType === 'leisure' ? `${10 + (index * 3)}:00 AM` :
                    `${9 + (index * 2)}:00 ${index < 2 ? 'AM' : 'PM'}`,
    orderInRoute: index + 1
  }));
  
  return {
    day: dayNumber,
    date: date,
    destinationName: destinationName,
    places: optimizedPlaces,
    totalTime: routeType === 'speed' ? `${optimizedPlaces.length * 1.5} hours` :
               routeType === 'leisure' ? `${optimizedPlaces.length * 2.5} hours` :
               `${optimizedPlaces.length * 2} hours`,
    walkingTime: routeType === 'speed' ? "45 minutes" : "30 minutes",
    transportTime: routeType === 'speed' ? "30 minutes" : "20 minutes",
    freeTime: routeType === 'speed' ? "2 hours" :
              routeType === 'leisure' ? "5 hours" :
              "3 hours",
    allocatedDays: totalDays,
    isTentative: true
  };
};
