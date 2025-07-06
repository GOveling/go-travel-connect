
// AI protocol for determining optimal tour booking dates and recommendations based on itinerary

import { getDestinationDateRanges } from "@/utils/dateUtils";
import { Trip } from "@/types";

export interface TourDateRecommendation {
  destination: string;
  date: string;
  duration: string;
  tourType: string;
  participants: number;
  aiOptimized: boolean;
  reason: string;
  destinationIndex: number;
  suggestedTours: string[];
}

export interface AITourBookingPlan {
  tripId: string;
  tripName: string;
  totalDestinations: number;
  recommendations: TourDateRecommendation[];
  aiConfidence: 'high' | 'medium' | 'low';
  optimizationNotes: string[];
}

export const getAITourBookingPlan = (
  trip: Trip
): AITourBookingPlan => {
  console.log('🤖 AI Tour Booking Analysis:', {
    tripName: trip.name,
    destinations: trip.coordinates?.length || 0,
    dates: trip.dates,
    savedPlaces: trip.savedPlaces?.length || 0
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

  // Get destination date ranges using existing utility
  const destinationRanges = getDestinationDateRanges(trip.dates, totalDestinations);
  
  const recommendations: TourDateRecommendation[] = [];
  const optimizationNotes: string[] = [];

  destinationRanges.forEach((range, index) => {
    const destination = destinations[index];
    
    // Get saved places for this destination
    const savedPlacesForDestination = trip.savedPlaces?.filter(
      place => place.destinationName === destination.name
    ) || [];

    // AI Logic for tour recommendations based on saved places
    let tourType = 'city';
    let duration = 'half-day';
    let suggestedTours: string[] = [];
    let aiOptimized = false;
    let reason = '';

    if (savedPlacesForDestination.length > 0) {
      // Analyze saved places to determine tour type
      const categories = savedPlacesForDestination.map(place => place.category.toLowerCase());
      
      if (categories.includes('museum') || categories.includes('historical')) {
        tourType = 'cultural';
        suggestedTours.push('Guided Historical Tour', 'Museum Hopping Tour');
        reason = 'IA detectó lugares históricos/culturales en lugares guardados';
      } else if (categories.includes('restaurant') || categories.includes('food')) {
        tourType = 'food';
        suggestedTours.push('Food Walking Tour', 'Local Cuisine Experience');
        reason = 'IA detectó interés culinario en lugares guardados';
      } else if (categories.includes('nature') || categories.includes('park')) {
        tourType = 'nature';
        suggestedTours.push('Nature Walking Tour', 'Outdoor Adventure');
        reason = 'IA detectó lugares naturales en lugares guardados';
      } else if (categories.includes('shopping') || categories.includes('market')) {
        tourType = 'city';
        suggestedTours.push('City Walking Tour', 'Shopping District Tour');
        reason = 'IA detectó actividades urbanas en lugares guardados';
      } else {
        tourType = 'city';
        suggestedTours.push('General City Tour', 'Local Highlights Tour');
        reason = 'Tour general basado en lugares guardados variados';
      }

      // Determine duration based on number of places and days
      if (savedPlacesForDestination.length >= 5 || range.days >= 3) {
        duration = 'full-day';
        reason += '. Duración extendida por múltiples lugares de interés';
      } else if (savedPlacesForDestination.length <= 2) {
        duration = 'half-day';
        reason += '. Duración optimizada para lugares específicos';
      }

      aiOptimized = true;
      optimizationNotes.push(`${destination.name}: ${savedPlacesForDestination.length} lugares analizados para recomendaciones`);
    } else {
      // Default recommendations when no saved places
      tourType = 'city';
      duration = 'half-day';
      suggestedTours.push('City Highlights Tour', 'Walking Tour');
      reason = 'Recomendación general - considera agregar lugares en AI Smart Route';
      optimizationNotes.push(`${destination.name}: Sin lugares guardados - recomendaciones generales`);
    }

    // Format date for input fields (use middle date of range)
    const middleDate = new Date(range.startDate);
    middleDate.setDate(middleDate.getDate() + Math.floor(range.days / 2));
    const formatDateForInput = (date: Date) => date.toISOString().split('T')[0];

    recommendations.push({
      destination: destination.name,
      date: formatDateForInput(middleDate),
      duration,
      tourType,
      participants: trip.travelers || 2,
      aiOptimized,
      reason,
      destinationIndex: index,
      suggestedTours
    });
  });

  // Determine AI confidence based on saved places and trip complexity
  let confidence: 'high' | 'medium' | 'low' = 'medium';
  
  const totalSavedPlaces = trip.savedPlaces?.length || 0;
  if (totalSavedPlaces >= 5) {
    confidence = 'high';
    optimizationNotes.push('Alta confianza - muchos lugares guardados para análisis');
  } else if (totalSavedPlaces > 0) {
    confidence = 'medium';
    optimizationNotes.push('Confianza media - algunos lugares guardados disponibles');
  } else {
    confidence = 'low';
    optimizationNotes.push('Baja confianza - sin lugares guardados para análisis específico');
  }

  const plan: AITourBookingPlan = {
    tripId: trip.id,
    tripName: trip.name,
    totalDestinations,
    recommendations,
    aiConfidence: confidence,
    optimizationNotes
  };

  console.log('🤖 AI Tour Booking Plan:', plan);
  
  return plan;
};

export const formatTourBookingSummary = (plan: AITourBookingPlan): string => {
  const destinations = plan.recommendations.map(rec => rec.destination).join(', ');
  const totalTours = plan.recommendations.length;
  
  return `${totalTours} tours recomendados en: ${destinations}`;
};

export const getTotalTourBudgetEstimate = (plan: AITourBookingPlan): string => {
  const avgTourPrice = 75; // USD average per tour
  const totalTours = plan.recommendations.length;
  const estimatedTotal = totalTours * avgTourPrice * (plan.recommendations[0]?.participants || 2);
  
  return `$${estimatedTotal.toLocaleString()} USD aprox. (${totalTours} tours)`;
};
