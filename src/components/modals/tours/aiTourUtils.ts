
import { Trip, SavedPlace } from "@/types";
import { getDestinationDateRanges } from "@/utils/dateUtils";
import { getSavedPlacesByDestination } from "@/utils/placeUtils";

export interface TourRecommendation {
  destination: string;
  date: string;
  tourType: string;
  duration: string;
  participants: number;
  aiOptimized: boolean;
  reason: string;
  relatedPlaces: string[];
  destinationIndex: number;
  priority: 'high' | 'medium' | 'low';
}

export interface AITourPlan {
  tripId: number;
  tripName: string;
  totalDestinations: number;
  recommendations: TourRecommendation[];
  aiConfidence: 'high' | 'medium' | 'low';
  optimizationNotes: string[];
}

const getTourTypeFromPlaces = (places: SavedPlace[]): string => {
  const categories = places.map(place => place.category.toLowerCase());
  
  if (categories.some(cat => cat.includes('museum') || cat.includes('historical') || cat.includes('monument'))) {
    return 'cultural';
  }
  if (categories.some(cat => cat.includes('restaurant') || cat.includes('food') || cat.includes('market'))) {
    return 'food';
  }
  if (categories.some(cat => cat.includes('park') || cat.includes('nature') || cat.includes('beach'))) {
    return 'nature';
  }
  if (categories.some(cat => cat.includes('adventure') || cat.includes('activity'))) {
    return 'adventure';
  }
  if (categories.some(cat => cat.includes('city') || cat.includes('urban'))) {
    return 'city';
  }
  
  return 'cultural'; // Default fallback
};

const getDurationFromPlaces = (places: SavedPlace[], days: number): string => {
  const totalEstimatedTime = places.reduce((total, place) => {
    const timeStr = place.estimatedTime.toLowerCase();
    if (timeStr.includes('hour')) {
      const hours = parseInt(timeStr.match(/\d+/)?.[0] || '2');
      return total + hours;
    }
    return total + 2; // Default 2 hours per place
  }, 0);

  if (totalEstimatedTime <= 4 || days === 1) {
    return 'half-day';
  } else if (totalEstimatedTime <= 8) {
    return 'full-day';
  } else {
    return 'multi-day';
  }
};

const getPriorityFromPlaces = (places: SavedPlace[]): 'high' | 'medium' | 'low' => {
  const highPriorityCount = places.filter(place => place.priority === 'high').length;
  const mediumPriorityCount = places.filter(place => place.priority === 'medium').length;
  
  if (highPriorityCount > places.length / 2) {
    return 'high';
  } else if (highPriorityCount + mediumPriorityCount > places.length / 2) {
    return 'medium';
  } else {
    return 'low';
  }
};

export const getAITourPlan = (trip: Trip): AITourPlan => {
  console.log('🤖 AI Tour Planning Analysis:', {
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
      optimizationNotes: ['No se encontraron destinos en el itinerario']
    };
  }

  const destinationRanges = getDestinationDateRanges(trip.dates, totalDestinations);
  const savedPlacesByDestination = getSavedPlacesByDestination(trip);
  
  const recommendations: TourRecommendation[] = [];
  const optimizationNotes: string[] = [];

  destinationRanges.forEach((range, index) => {
    const destination = destinations[index];
    const places = savedPlacesByDestination[destination.name] || [];
    
    if (places.length === 0) {
      optimizationNotes.push(`${destination.name}: No se encontraron lugares guardados para recomendar tours`);
      return;
    }

    // AI Logic for tour recommendations
    const tourType = getTourTypeFromPlaces(places);
    const duration = getDurationFromPlaces(places, range.days);
    const priority = getPriorityFromPlaces(places);
    
    // Determine optimal date within the destination range
    const optimalDate = range.days === 1 ? 
      range.startDate : 
      new Date(range.startDate.getTime() + Math.floor(range.days / 2) * 24 * 60 * 60 * 1000);

    // Format date for input (YYYY-MM-DD)
    const formatDateForInput = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    let reason = '';
    let aiOptimized = false;

    if (places.length >= 3) {
      reason = `Tour ${tourType} recomendado basado en ${places.length} lugares guardados de alta relevancia`;
      aiOptimized = true;
    } else if (places.length === 2) {
      reason = `Tour ${tourType} sugerido para complementar los ${places.length} lugares guardados`;
      aiOptimized = true;
    } else {
      reason = `Tour ${tourType} básico para explorar más allá del lugar guardado`;
    }

    if (range.days > 3) {
      optimizationNotes.push(`${destination.name}: Estancia larga - considerar múltiples tours`);
    }

    recommendations.push({
      destination: destination.name,
      date: formatDateForInput(optimalDate),
      tourType,
      duration,
      participants: trip.travelers || 2,
      aiOptimized,
      reason,
      relatedPlaces: places.map(place => place.name),
      destinationIndex: index,
      priority
    });
  });

  // Determine AI confidence
  let confidence: 'high' | 'medium' | 'low' = 'high';
  const totalSavedPlaces = Object.values(savedPlacesByDestination).reduce((total, places) => total + places.length, 0);
  
  if (totalSavedPlaces < totalDestinations) {
    confidence = 'medium';
    optimizationNotes.push('Algunas destinos tienen pocos lugares guardados - tours genéricos sugeridos');
  }
  
  if (totalDestinations > 4) {
    confidence = 'medium';
    optimizationNotes.push('Itinerario complejo - revisar recomendaciones de tours');
  }

  if (totalSavedPlaces === 0) {
    confidence = 'low';
  }

  const plan: AITourPlan = {
    tripId: trip.id,
    tripName: trip.name,
    totalDestinations,
    recommendations,
    aiConfidence: confidence,
    optimizationNotes
  };

  console.log('🤖 AI Tour Plan:', plan);
  
  return plan;
};

export const formatTourSummary = (plan: AITourPlan): string => {
  const totalTours = plan.recommendations.length;
  const destinations = plan.recommendations.map(rec => rec.destination).join(', ');
  
  return `${totalTours} tours recomendados en ${plan.totalDestinations} destinos: ${destinations}`;
};

export const getTotalTourBudgetEstimate = (plan: AITourPlan): string => {
  const tourCosts = {
    'half-day': 50,
    'full-day': 120,
    'multi-day': 250
  };
  
  const estimatedTotal = plan.recommendations.reduce((total, rec) => {
    return total + (tourCosts[rec.duration as keyof typeof tourCosts] || 80);
  }, 0);
  
  return `$${estimatedTotal.toLocaleString()} USD aprox. (${plan.recommendations.length} tours)`;
};
