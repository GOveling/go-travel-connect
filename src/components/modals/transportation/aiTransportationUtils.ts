
import { Trip, SavedPlace } from "@/types";
import { getDestinationDateRanges } from "@/utils/dateUtils";
import { getSavedPlacesByDestination } from "@/utils/placeUtils";

export interface TransportationRecommendation {
  destination: string;
  date: string;
  transportType: string;
  route: string;
  estimatedDuration: string;
  estimatedCost: string;
  aiOptimized: boolean;
  reason: string;
  relatedPlaces: string[];
  destinationIndex: number;
  priority: 'high' | 'medium' | 'low';
  bookingRequired: boolean;
  transportCategory: 'airport-arrival' | 'inter-destination' | 'local-transport' | 'airport-departure' | 'home-return';
}

export interface AITransportationPlan {
  tripId: number;
  tripName: string;
  totalDestinations: number;
  recommendations: TransportationRecommendation[];
  aiConfidence: 'high' | 'medium' | 'low';
  optimizationNotes: string[];
  totalEstimatedCost: string;
  fullJourneyMap: {
    airportArrivals: number;
    interDestinationTransports: number;
    localTransports: number;
    airportDepartures: number;
    homeReturn: boolean;
  };
}

const getTransportTypeFromPlaces = (places: SavedPlace[], destinationName: string): string => {
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

const getTransportDetails = (transportType: string, origin: string, destination: string) => {
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

const getPriorityFromTransportType = (transportType: string): 'high' | 'medium' | 'low' => {
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
const formatDateForInput = (date: Date) => {
  return date.toISOString().split('T')[0];
};

// Generate airport arrival transport for first destination
const generateAirportArrivalTransport = (
  destination: any, 
  places: SavedPlace[], 
  startDate: Date, 
  index: number
): TransportationRecommendation => {
  const airportTransportType = places.length > 3 ? 'airport-shuttle' : 'taxi';
  const details = getTransportDetails(airportTransportType, `Aeropuerto ${destination.name}`, destination.name);
  
  return {
    destination: destination.name,
    date: formatDateForInput(startDate),
    transportType: airportTransportType,
    route: `Aeropuerto ${destination.name} → Centro ciudad`,
    estimatedDuration: details.duration,
    estimatedCost: details.cost,
    aiOptimized: true,
    reason: `${airportTransportType} recomendado desde aeropuerto basado en ${places.length} lugares guardados`,
    relatedPlaces: places.slice(0, 3).map(place => place.name),
    destinationIndex: index,
    priority: 'high' as const,
    bookingRequired: details.bookingRequired,
    transportCategory: 'airport-arrival' as const
  };
};

// Generate airport departure transport for last destination
const generateAirportDepartureTransport = (
  destination: any, 
  places: SavedPlace[], 
  endDate: Date, 
  index: number
): TransportationRecommendation => {
  const airportTransportType = places.length > 3 ? 'airport-shuttle' : 'taxi';
  const details = getTransportDetails(airportTransportType, destination.name, `Aeropuerto ${destination.name}`);
  
  return {
    destination: destination.name,
    date: formatDateForInput(endDate),
    transportType: airportTransportType,
    route: `Centro ciudad → Aeropuerto ${destination.name}`,
    estimatedDuration: details.duration,
    estimatedCost: details.cost,
    aiOptimized: true,
    reason: `${airportTransportType} para salida desde aeropuerto`,
    relatedPlaces: places.slice(0, 3).map(place => place.name),
    destinationIndex: index,
    priority: 'high' as const,
    bookingRequired: details.bookingRequired,
    transportCategory: 'airport-departure' as const
  };
};

// Generate home return transport option
const generateHomeReturnTransport = (
  trip: Trip
): TransportationRecommendation => {
  return {
    destination: 'Casa',
    date: formatDateForInput(new Date()), // Current date as placeholder
    transportType: 'taxi',
    route: 'Aeropuerto → Casa',
    estimatedDuration: '45-90 min',
    estimatedCost: '$30-80',
    aiOptimized: true,
    reason: 'Transporte opcional para retorno a casa desde aeropuerto',
    relatedPlaces: [],
    destinationIndex: -1,
    priority: 'medium' as const,
    bookingRequired: false,
    transportCategory: 'home-return' as const
  };
};

export const getAITransportationPlan = (trip: Trip): AITransportationPlan => {
  console.log('🚗 AI Transportation Planning Analysis:', {
    tripName: trip.name,
    destinations: trip.coordinates?.length || 0,
    dates: trip.dates
  });

  const destinations = trip.coordinates || [];
  const totalDestinations = destinations.length;
  
  if (totalDestinations === 0) {
    return {
      tripId: trip.id,
      tripName: trip.name,
      totalDestinations: 0,
      recommendations: [],
      aiConfidence: 'low',
      optimizationNotes: ['No se encontraron destinos en el itinerario'],
      totalEstimatedCost: '$0',
      fullJourneyMap: {
        airportArrivals: 0,
        interDestinationTransports: 0,
        localTransports: 0,
        airportDepartures: 0,
        homeReturn: false
      }
    };
  }

  const destinationRanges = getDestinationDateRanges(trip.dates, totalDestinations);
  const savedPlacesByDestination = getSavedPlacesByDestination(trip);
  
  const recommendations: TransportationRecommendation[] = [];
  const optimizationNotes: string[] = [];
  let totalCost = 0;
  let journeyMap = {
    airportArrivals: 0,
    interDestinationTransports: 0,
    localTransports: 0,
    airportDepartures: 0,
    homeReturn: false
  };

  destinationRanges.forEach((range, index) => {
    const destination = destinations[index];
    const places = savedPlacesByDestination[destination.name] || [];
    
    // 1. Airport arrival transport for first destination
    if (index === 0) {
      const arrivalTransport = generateAirportArrivalTransport(destination, places, range.startDate, index);
      recommendations.push(arrivalTransport);
      journeyMap.airportArrivals++;
      
      // Extract cost for calculation
      const costMatch = arrivalTransport.estimatedCost.match(/\$(\d+)/);
      if (costMatch) {
        totalCost += parseInt(costMatch[1]);
      }
    }

    // 2. Inter-destination transportation (between destinations)
    if (index > 0) {
      const previousDestination = destinations[index - 1];
      const transportType = getTransportTypeFromPlaces(places, destination.name);
      const details = getTransportDetails(transportType, previousDestination.name, destination.name);
      const priority = getPriorityFromTransportType(transportType);
      
      // Extract cost for calculation
      const costMatch = details.cost.match(/\$(\d+)/);
      if (costMatch) {
        totalCost += parseInt(costMatch[1]);
      }

      let reason = '';
      if (places.length >= 2) {
        reason = `${transportType} recomendado basado en ${places.length} lugares guardados y tipo de destino`;
      } else {
        reason = `${transportType} sugerido para conexión eficiente entre destinos`;
      }

      recommendations.push({
        destination: destination.name,
        date: formatDateForInput(range.startDate),
        transportType,
        route: details.route,
        estimatedDuration: details.duration,
        estimatedCost: details.cost,
        aiOptimized: places.length > 0,
        reason,
        relatedPlaces: places.slice(0, 3).map(place => place.name),
        destinationIndex: index,
        priority,
        bookingRequired: details.bookingRequired,
        transportCategory: 'inter-destination' as const
      });
      journeyMap.interDestinationTransports++;
    }

    // 3. Local transportation within destination
    if (places.length > 1) {
      const localTransport = places.length > 3 ? 'metro' : 'taxi';
      const details = getTransportDetails(localTransport, '', destination.name);
      
      recommendations.push({
        destination: destination.name,
        date: formatDateForInput(range.startDate),
        transportType: localTransport,
        route: details.route,
        estimatedDuration: details.duration,
        estimatedCost: details.cost,
        aiOptimized: true,
        reason: `${localTransport} recomendado para moverse entre ${places.length} lugares guardados`,
        relatedPlaces: places.slice(0, 3).map(place => place.name),
        destinationIndex: index,
        priority: 'medium' as const,
        bookingRequired: details.bookingRequired,
        transportCategory: 'local-transport' as const
      });
      journeyMap.localTransports++;
    }

    // 4. Airport departure transport for last destination
    if (index === totalDestinations - 1) {
      const departureTransport = generateAirportDepartureTransport(destination, places, range.endDate, index);
      recommendations.push(departureTransport);
      journeyMap.airportDepartures++;
      
      // Extract cost for calculation
      const costMatch = departureTransport.estimatedCost.match(/\$(\d+)/);
      if (costMatch) {
        totalCost += parseInt(costMatch[1]);
      }
    }

    if (range.days > 4) {
      optimizationNotes.push(`${destination.name}: Estancia larga - considerar car rental para mayor flexibilidad`);
    }
  });

  // 5. Home return transport (optional)
  const homeReturnTransport = generateHomeReturnTransport(trip);
  recommendations.push(homeReturnTransport);
  journeyMap.homeReturn = true;

  // Add optimization notes for full journey
  optimizationNotes.push(`Itinerario completo: ${journeyMap.airportArrivals} llegadas, ${journeyMap.interDestinationTransports} conexiones, ${journeyMap.localTransports} transportes locales, ${journeyMap.airportDepartures} salidas`);

  // Determine AI confidence
  let confidence: 'high' | 'medium' | 'low' = 'high';
  const totalSavedPlaces = Object.values(savedPlacesByDestination).reduce((total, places) => total + places.length, 0);
  
  if (totalSavedPlaces < totalDestinations) {
    confidence = 'medium';
    optimizationNotes.push('Algunos destinos tienen pocos lugares guardados - transportes genéricos sugeridos');
  }
  
  if (totalDestinations > 5) {
    confidence = 'medium';
    optimizationNotes.push('Itinerario complejo - revisar opciones de transporte');
  }

  if (totalSavedPlaces === 0) {
    confidence = 'low';
  }

  const plan: AITransportationPlan = {
    tripId: trip.id,
    tripName: trip.name,
    totalDestinations,
    recommendations,
    aiConfidence: confidence,
    optimizationNotes,
    totalEstimatedCost: `$${totalCost.toLocaleString()} USD aprox.`,
    fullJourneyMap: journeyMap
  };

  console.log('🚗 AI Transportation Plan:', plan);
  
  return plan;
};

export const formatTransportationSummary = (plan: AITransportationPlan): string => {
  const totalTransports = plan.recommendations.length;
  const destinations = [...new Set(plan.recommendations.map(rec => rec.destination))].join(', ');
  
  return `${totalTransports} opciones de transporte en ${plan.totalDestinations} destinos: ${destinations}`;
};

export const getTransportationBudgetEstimate = (plan: AITransportationPlan): string => {
  return plan.totalEstimatedCost;
};
