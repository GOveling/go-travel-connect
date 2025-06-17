
import { SavedPlace } from "@/types";
import { TransportDetails } from "./types";

export const getTransportTypeFromPlaces = (places: SavedPlace[], destinationName: string): string => {
  const categories = places.map(place => place.category.toLowerCase());
  
  // Check for airport/flight indicators
  if (categories.some(cat => cat.includes('airport') || cat.includes('terminal'))) {
    return 'flight';
  }
  
  // Check for train stations
  if (categories.some(cat => cat.includes('train') || cat.includes('station'))) {
    return 'train';
  }
  
  // Check for port/ferry indicators
  if (categories.some(cat => cat.includes('port') || cat.includes('ferry') || cat.includes('harbor'))) {
    return 'ferry';
  }
  
  // Check for urban areas (metro/subway)
  if (categories.some(cat => cat.includes('museum') || cat.includes('restaurant') || cat.includes('shopping'))) {
    return 'metro';
  }
  
  // Check for nature/adventure areas (car rental)
  if (categories.some(cat => cat.includes('park') || cat.includes('nature') || cat.includes('beach'))) {
    return 'car-rental';
  }
  
  // Default to taxi for city areas
  return 'taxi';
};

export const getTransportDetails = (transportType: string, origin: string, destination: string): TransportDetails => {
  const details = {
    'flight': {
      duration: '2-4 horas',
      cost: '$200-500',
      route: `Vuelo ${origin} → ${destination}`,
      bookingRequired: true
    },
    'train': {
      duration: '3-6 horas',
      cost: '$50-150',
      route: `Tren ${origin} → ${destination}`,
      bookingRequired: true
    },
    'bus': {
      duration: '4-8 horas',
      cost: '$25-75',
      route: `Autobús ${origin} → ${destination}`,
      bookingRequired: true
    },
    'ferry': {
      duration: '2-12 horas',
      cost: '$75-200',
      route: `Ferry ${origin} → ${destination}`,
      bookingRequired: true
    },
    'car-rental': {
      duration: '2-6 horas',
      cost: '$40-80/día',
      route: `Auto rental en ${destination}`,
      bookingRequired: true
    },
    'taxi': {
      duration: '30-60 min',
      cost: '$15-50',
      route: `Taxi en ${destination}`,
      bookingRequired: false
    },
    'uber': {
      duration: '20-45 min',
      cost: '$10-35',
      route: `Uber en ${destination}`,
      bookingRequired: false
    },
    'metro': {
      duration: '15-30 min',
      cost: '$2-5',
      route: `Metro/Subway en ${destination}`,
      bookingRequired: false
    },
    'airport-shuttle': {
      duration: '45-90 min',
      cost: '$25-60',
      route: `Shuttle aeropuerto → ${destination}`,
      bookingRequired: true
    }
  };
  
  return details[transportType as keyof typeof details] || details.taxi;
};

export const getPriorityFromTransportType = (transportType: string): 'high' | 'medium' | 'low' => {
  const highPriority = ['flight', 'train', 'ferry'];
  const mediumPriority = ['bus', 'car-rental', 'airport-shuttle'];
  
  if (highPriority.includes(transportType)) {
    return 'high';
  } else if (mediumPriority.includes(transportType)) {
    return 'medium';
  } else {
    return 'low';
  }
};

// Helper function to format dates for input fields
export const formatDateForInput = (date: Date) => {
  return date.toISOString().split('T')[0];
};
