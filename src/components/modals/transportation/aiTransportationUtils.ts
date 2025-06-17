
import { Trip, SavedPlace } from "@/types";
import { getDestinationDateRanges } from "@/utils/dateUtils";
import { getSavedPlacesByDestination } from "@/utils/placeUtils";
import { AITransportationPlan, TransportationRecommendation } from "./types";
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

// Re-export types and utility functions for backwards compatibility
export type { AITransportationPlan, TransportationRecommendation } from "./types";
