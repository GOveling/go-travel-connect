
import { Trip, SavedPlace } from "@/types";
import { getDestinationDateRanges } from "@/utils/dateUtils";

export interface TourRecommendation {
  id: string;
  placeName: string;
  placeCategory: string;
  destinationName: string;
  suggestedDate: string;
  suggestedTime: string;
  recommendedDuration: string;
  tourType: 'cultural' | 'food' | 'nature' | 'adventure' | 'city' | 'historical';
  priority: 'high' | 'medium' | 'low';
  estimatedPrice: string;
  aiReason: string;
  place: SavedPlace;
}

export interface TourAIPlan {
  tripId: number;
  tripName: string;
  totalRecommendations: number;
  recommendations: TourRecommendation[];
  confidence: 'high' | 'medium' | 'low';
  optimizationNotes: string[];
}

export const generateTourRecommendations = (trip: Trip): TourAIPlan => {
  console.log('🤖 Generating AI Tour Recommendations for:', trip.name);

  const savedPlaces = trip.savedPlaces || [];
  const recommendations: TourRecommendation[] = [];
  const optimizationNotes: string[] = [];

  if (savedPlaces.length === 0) {
    return {
      tripId: trip.id,
      tripName: trip.name,
      totalRecommendations: 0,
      recommendations: [],
      confidence: 'low',
      optimizationNotes: ['No hay lugares guardados para generar recomendaciones de tours']
    };
  }

  // Get destination date ranges from AI Smart Route
  const destinationRanges = getDestinationDateRanges(trip.dates, trip.coordinates?.length || 1);

  savedPlaces.forEach((place, index) => {
    const destinationIndex = trip.coordinates?.findIndex(coord => 
      coord.name === place.destinationName
    ) || 0;
    
    const dateRange = destinationRanges[destinationIndex];
    if (!dateRange) return;

    // AI Protocol: Determine tour type and timing based on place category
    let tourType: TourRecommendation['tourType'] = 'city';
    let recommendedDuration = '3 horas';
    let suggestedTime = '09:00';
    let priority: TourRecommendation['priority'] = 'medium';
    let estimatedPrice = '$45';
    let aiReason = '';

    switch (place.category.toLowerCase()) {
      case 'museo':
      case 'museum':
      case 'monument':
      case 'historical':
        tourType = 'cultural';
        recommendedDuration = '2-3 horas';
        suggestedTime = '10:00';
        priority = 'high';
        estimatedPrice = '$35';
        aiReason = 'Tour cultural recomendado para explorar historia y patrimonio local con guía especializado';
        break;
      
      case 'restaurant':
      case 'food':
      case 'market':
      case 'mercado':
        tourType = 'food';
        recommendedDuration = '3-4 horas';
        suggestedTime = '11:00';
        priority = 'high';
        estimatedPrice = '$65';
        aiReason = 'Tour gastronómico para descubrir sabores auténticos y técnicas culinarias locales';
        break;
      
      case 'nature':
      case 'park':
      case 'beach':
      case 'playa':
        tourType = 'nature';
        recommendedDuration = '4-6 horas';
        suggestedTime = '08:00';
        priority = 'medium';
        estimatedPrice = '$55';
        aiReason = 'Tour de naturaleza para conectar con el entorno natural y vida silvestre local';
        break;
      
      case 'adventure':
      case 'activity':
      case 'sport':
        tourType = 'adventure';
        recommendedDuration = '5-8 horas';
        suggestedTime = '07:00';
        priority = 'high';
        estimatedPrice = '$85';
        aiReason = 'Tour de aventura para experiencias emocionantes y actividades al aire libre';
        break;
      
      default:
        tourType = 'city';
        recommendedDuration = '2-3 horas';
        suggestedTime = '14:00';
        priority = 'medium';
        estimatedPrice = '$40';
        aiReason = 'Tour de ciudad para conocer puntos destacados y cultura local';
    }

    // Adjust based on place priority
    if (place.priority === 'high') {
      priority = 'high';
      estimatedPrice = `$${parseInt(estimatedPrice.replace('$', '')) + 15}`;
    } else if (place.priority === 'low') {
      priority = 'low';
      estimatedPrice = `$${parseInt(estimatedPrice.replace('$', '')) - 10}`;
    }

    // Calculate suggested date (distribute across available days)
    const dayOffset = Math.floor(index % 3); // Distribute across first 3 days
    const suggestedDate = new Date(dateRange.startDate);
    suggestedDate.setDate(suggestedDate.getDate() + dayOffset);

    recommendations.push({
      id: `tour-${trip.id}-${place.id}-${index}`,
      placeName: place.name,
      placeCategory: place.category,
      destinationName: place.destinationName,
      suggestedDate: suggestedDate.toISOString().split('T')[0],
      suggestedTime,
      recommendedDuration,
      tourType,
      priority,
      estimatedPrice,
      aiReason,
      place
    });
  });

  // Sort by priority and date
  recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }
    return new Date(a.suggestedDate).getTime() - new Date(b.suggestedDate).getTime();
  });

  // AI Confidence calculation
  let confidence: 'high' | 'medium' | 'low' = 'high';
  
  if (savedPlaces.length < 3) {
    confidence = 'medium';
    optimizationNotes.push('Pocas ubicaciones guardadas - mejores recomendaciones con más lugares');
  }
  
  if (recommendations.length > 8) {
    confidence = 'medium';
    optimizationNotes.push('Muchas recomendaciones - considera priorizar tours más importantes');
  }

  optimizationNotes.push(`${recommendations.length} tours recomendados basados en tu itinerario de IA Smart Route`);
  optimizationNotes.push('Precios y horarios optimizados según categoría de lugares y fechas del viaje');

  return {
    tripId: trip.id,
    tripName: trip.name,
    totalRecommendations: recommendations.length,
    recommendations,
    confidence,
    optimizationNotes
  };
};

export const getTourTypeIcon = (tourType: string) => {
  switch (tourType) {
    case 'cultural': return '🏛️';
    case 'food': return '🍽️';
    case 'nature': return '🌿';
    case 'adventure': return '🏔️';
    case 'city': return '🏙️';
    case 'historical': return '📜';
    default: return '🗺️';
  }
};

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800 border-red-300';
    case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'low': return 'bg-green-100 text-green-800 border-green-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};
