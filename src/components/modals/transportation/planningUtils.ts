
import { SavedPlace } from "@/types";

export const calculateAIConfidence = (totalDestinations: number, totalSavedPlaces: number): 'high' | 'medium' | 'low' => {
  if (totalSavedPlaces === 0) {
    return 'low';
  }
  
  if (totalSavedPlaces < totalDestinations) {
    return 'medium';
  }
  
  if (totalDestinations > 5) {
    return 'medium';
  }
  
  return 'high';
};

export const generateOptimizationNotes = (
  destinations: any[],
  destinationRanges: any[],
  savedPlacesByDestination: Record<string, SavedPlace[]>,
  journeyMap: any,
  totalDestinations: number,
  totalSavedPlaces: number
): string[] => {
  const optimizationNotes: string[] = [];

  // Add notes for long stays
  destinationRanges.forEach((range, index) => {
    const destination = destinations[index];
    if (range.days > 4) {
      optimizationNotes.push(`${destination.name}: Estancia larga - considerar car rental para mayor flexibilidad`);
    }
  });

  // Add journey summary
  optimizationNotes.push(`Itinerario completo: ${journeyMap.airportArrivals} llegadas, ${journeyMap.interDestinationTransports} conexiones, ${journeyMap.localTransports} transportes locales, ${journeyMap.airportDepartures} salidas`);

  // Add confidence-based notes
  if (totalSavedPlaces < totalDestinations) {
    optimizationNotes.push('Algunos destinos tienen pocos lugares guardados - transportes genéricos sugeridos');
  }
  
  if (totalDestinations > 5) {
    optimizationNotes.push('Itinerario complejo - revisar opciones de transporte');
  }

  return optimizationNotes;
};

export const formatTransportationSummary = (plan: any): string => {
  const totalTransports = plan.recommendations.length;
  const destinations = [...new Set(plan.recommendations.map((rec: any) => rec.destination))].join(', ');
  
  return `${totalTransports} opciones de transporte en ${plan.totalDestinations} destinos: ${destinations}`;
};

export const getTransportationBudgetEstimate = (plan: any): string => {
  return plan.totalEstimatedCost;
};
