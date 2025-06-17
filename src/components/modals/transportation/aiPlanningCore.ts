
import { Trip } from "@/types";
import { getDestinationDateRanges } from "@/utils/dateUtils";
import { getSavedPlacesByDestination } from "@/utils/placeUtils";
import { AITransportationPlan } from "./types";
import { generateTransportationRecommendations } from "./recommendationGenerator";
import { calculateAIConfidence, generateOptimizationNotes } from "./planningUtils";

export const generateAITransportationPlan = (trip: Trip): AITransportationPlan => {
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
  
  const { recommendations, journeyMap, totalCost } = generateTransportationRecommendations(
    destinations,
    destinationRanges,
    savedPlacesByDestination,
    trip
  );

  const totalSavedPlaces = Object.values(savedPlacesByDestination).reduce((total, places) => total + places.length, 0);
  const confidence = calculateAIConfidence(totalDestinations, totalSavedPlaces);
  const optimizationNotes = generateOptimizationNotes(
    destinations,
    destinationRanges,
    savedPlacesByDestination,
    journeyMap,
    totalDestinations,
    totalSavedPlaces
  );

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
