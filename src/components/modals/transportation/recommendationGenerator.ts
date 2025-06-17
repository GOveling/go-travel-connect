
import { Trip, SavedPlace } from "@/types";
import { TransportationRecommendation } from "./types";
import { 
  getTransportTypeFromPlaces, 
  getTransportDetails, 
  getPriorityFromTransportType,
  formatDateForInput 
} from "./transportUtils";
import { 
  generateAirportArrivalTransport,
  generateAirportDepartureTransport,
  generateHomeReturnTransport 
} from "./transportGenerators";

interface RecommendationResult {
  recommendations: TransportationRecommendation[];
  journeyMap: {
    airportArrivals: number;
    interDestinationTransports: number;
    localTransports: number;
    airportDepartures: number;
    homeReturn: boolean;
  };
  totalCost: number;
}

export const generateTransportationRecommendations = (
  destinations: any[],
  destinationRanges: any[],
  savedPlacesByDestination: Record<string, SavedPlace[]>,
  trip: Trip
): RecommendationResult => {
  const recommendations: TransportationRecommendation[] = [];
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
      
      const costMatch = arrivalTransport.estimatedCost.match(/\$(\d+)/);
      if (costMatch) {
        totalCost += parseInt(costMatch[1]);
      }
    }

    // 2. Inter-destination transportation
    if (index > 0) {
      const previousDestination = destinations[index - 1];
      const transportType = getTransportTypeFromPlaces(places, destination.name);
      const details = getTransportDetails(transportType, previousDestination.name, destination.name);
      const priority = getPriorityFromTransportType(transportType);
      
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
    if (index === destinationRanges.length - 1) {
      const departureTransport = generateAirportDepartureTransport(destination, places, range.endDate, index);
      recommendations.push(departureTransport);
      journeyMap.airportDepartures++;
      
      const costMatch = departureTransport.estimatedCost.match(/\$(\d+)/);
      if (costMatch) {
        totalCost += parseInt(costMatch[1]);
      }
    }
  });

  // 5. Home return transport
  const homeReturnTransport = generateHomeReturnTransport(trip);
  recommendations.push(homeReturnTransport);
  journeyMap.homeReturn = true;

  return { recommendations, journeyMap, totalCost };
};
