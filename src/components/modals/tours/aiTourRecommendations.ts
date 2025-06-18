
import { Trip, DayItinerary, OptimizedPlace } from "@/types";
import { getDestinationDateRanges } from "@/utils/dateUtils";

export interface TourRecommendation {
  place: OptimizedPlace;
  date: string;
  suggestedTourType: string;
  suggestedDuration: string;
  aiReason: string;
  priority: 'high' | 'medium' | 'low';
}

export interface AITourPlan {
  tripId: number;
  tripName: string;
  totalRecommendations: number;
  recommendations: TourRecommendation[];
  aiConfidence: 'high' | 'medium' | 'low';
  optimizationNotes: string[];
}

export const getAITourRecommendations = (trip: Trip): AITourPlan => {
  console.log('🤖 AI Tour Recommendations Analysis:', {
    tripName: trip.name,
    savedPlaces: trip.savedPlaces?.length || 0,
    destinations: trip.coordinates?.length || 0
  });

  const savedPlaces = trip.savedPlaces || [];
  const recommendations: TourRecommendation[] = [];
  const optimizationNotes: string[] = [];

  if (savedPlaces.length === 0) {
    return {
      tripId: trip.id,
      tripName: trip.name,
      totalRecommendations: 0,
      recommendations: [],
      aiConfidence: 'low',
      optimizationNotes: ['No hay lugares guardados para generar recomendaciones de tours']
    };
  }

  // Get destination date ranges
  const destinationRanges = getDestinationDateRanges(trip.dates, trip.coordinates?.length || 1);

  // AI Protocol: Analyze each saved place and suggest tours
  savedPlaces.forEach((place) => {
    const destinationIndex = trip.coordinates?.findIndex(coord => 
      coord.name === place.destinationName
    ) || 0;
    
    const dateRange = destinationRanges[destinationIndex];
    if (!dateRange) return;

    // AI Logic for tour type selection based on place category
    let suggestedTourType = '';
    let suggestedDuration = '';
    let aiReason = '';
    let priority: 'high' | 'medium' | 'low' = 'medium';

    switch (place.category.toLowerCase()) {
      case 'museo':
      case 'monument':
      case 'historical':
        suggestedTourType = 'cultural';
        suggestedDuration = 'half-day';
        aiReason = 'Tour cultural recomendado para explorar la historia y cultura local';
        priority = 'high';
        break;
      
      case 'restaurant':
      case 'food':
      case 'market':
        suggestedTourType = 'food';
        suggestedDuration = 'half-day';
        aiReason = 'Tour gastronómico para descubrir la cocina local auténtica';
        priority = 'high';
        break;
      
      case 'nature':
      case 'park':
      case 'beach':
        suggestedTourType = 'nature';
        suggestedDuration = 'full-day';
        aiReason = 'Tour de naturaleza para disfrutar al máximo del entorno natural';
        priority = 'medium';
        break;
      
      case 'adventure':
      case 'activity':
        suggestedTourType = 'adventure';
        suggestedDuration = 'full-day';
        aiReason = 'Tour de aventura para una experiencia emocionante y activa';
        priority = 'high';
        break;
      
      default:
        suggestedTourType = 'city';
        suggestedDuration = 'half-day';
        aiReason = 'Tour de ciudad para conocer los puntos destacados del área';
        priority = 'medium';
    }

    // Adjust based on place priority
    if (place.priority === 'high') {
      priority = 'high';
    } else if (place.priority === 'low') {
      priority = 'low';
    }

    recommendations.push({
      place: {
        ...place,
        lat: place.lat || 0,
        lng: place.lng || 0,
        aiRecommendedDuration: place.estimatedTime,
        bestTimeToVisit: 'Morning',
        orderInRoute: 1
      },
      date: dateRange.startDate.toISOString().split('T')[0],
      suggestedTourType,
      suggestedDuration,
      aiReason,
      priority
    });
  });

  // Sort by priority and date
  recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Determine AI confidence
  let confidence: 'high' | 'medium' | 'low' = 'high';
  
  if (savedPlaces.length < 3) {
    confidence = 'medium';
    optimizationNotes.push('Pocas ubicaciones guardadas - considera agregar más lugares para mejores recomendaciones');
  }
  
  if (recommendations.length > 10) {
    confidence = 'medium';
    optimizationNotes.push('Muchas recomendaciones generadas - considera priorizar los tours más importantes');
  }

  optimizationNotes.push(`Generadas ${recommendations.length} recomendaciones de tours basadas en tus lugares guardados`);
  optimizationNotes.push('Los tours están optimizados por categoría de lugar y fechas del itinerario');

  return {
    tripId: trip.id,
    tripName: trip.name,
    totalRecommendations: recommendations.length,
    recommendations,
    aiConfidence: confidence,
    optimizationNotes
  };
};

export const formatTourRecommendationSummary = (plan: AITourPlan): string => {
  const highPriority = plan.recommendations.filter(r => r.priority === 'high').length;
  const destinations = [...new Set(plan.recommendations.map(r => r.place.destinationName))];
  
  return `${plan.totalRecommendations} tours recomendados (${highPriority} prioritarios) en ${destinations.length} destinos`;
};
