
// AI protocol for determining optimal hotel booking dates based on itinerary

import { getDestinationDateRanges } from "@/utils/dateUtils";
import { Trip } from "@/types";

export interface HotelDateRecommendation {
  destination: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  aiOptimized: boolean;
  reason: string;
  destinationIndex: number;
}

export interface AIHotelBookingPlan {
  tripId: string;
  tripName: string;
  totalDestinations: number;
  recommendations: HotelDateRecommendation[];
  aiConfidence: 'high' | 'medium' | 'low';
  optimizationNotes: string[];
}

export const getAIHotelBookingPlan = (
  trip: Trip
): AIHotelBookingPlan => {
  console.log('🤖 AI Hotel Booking Analysis:', {
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

  // Get destination date ranges using existing utility
  const destinationRanges = getDestinationDateRanges(trip.dates, totalDestinations);
  
  const recommendations: HotelDateRecommendation[] = [];
  const optimizationNotes: string[] = [];

  destinationRanges.forEach((range, index) => {
    const destination = destinations[index];
    
    // AI Logic for hotel dates optimization
    let checkInDate = new Date(range.startDate);
    let checkOutDate = new Date(range.endDate);
    let aiOptimized = false;
    let reason = '';

    // AI Protocol: Optimize check-in/check-out times
    if (range.days === 1) {
      // Single day stay - extend to next day for proper hotel stay
      checkOutDate.setDate(checkOutDate.getDate() + 1);
      aiOptimized = true;
      reason = 'IA extendió estancia mínima a 1 noche para reserva hotelera válida';
      optimizationNotes.push(`${destination.name}: Extendido de estancia de día a 1 noche`);
    } else if (range.days >= 7) {
      // Long stays - suggest weekly rates
      reason = `Estancia larga (${range.days} días). Buscar tarifas semanales/mensuales`;
      optimizationNotes.push(`${destination.name}: Considerar tarifas de estancia larga`);
    } else {
      reason = `Estancia óptima de ${range.days} días`;
    }

    // Calculate nights
    const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));

    // Format dates for input fields (YYYY-MM-DD)
    const formatDateForInput = (date: Date) => {
      return date.toISOString().split('T')[0];
    };

    recommendations.push({
      destination: destination.name,
      checkIn: formatDateForInput(checkInDate),
      checkOut: formatDateForInput(checkOutDate),
      nights: nights,
      aiOptimized,
      reason,
      destinationIndex: index
    });
  });

  // Determine AI confidence based on trip complexity
  let confidence: 'high' | 'medium' | 'low' = 'high';
  
  if (totalDestinations > 5) {
    confidence = 'medium';
    optimizationNotes.push('Itinerario complejo con múltiples destinos - revisar fechas');
  }
  
  if (totalDestinations === 1) {
    confidence = 'high';
    optimizationNotes.push('Itinerario simple - fechas optimizadas automáticamente');
  }

  const plan: AIHotelBookingPlan = {
    tripId: trip.id,
    tripName: trip.name,
    totalDestinations,
    recommendations,
    aiConfidence: confidence,
    optimizationNotes
  };

  console.log('🤖 AI Hotel Booking Plan:', plan);
  
  return plan;
};

export const formatHotelBookingSummary = (plan: AIHotelBookingPlan): string => {
  const totalNights = plan.recommendations.reduce((sum, rec) => sum + rec.nights, 0);
  const destinations = plan.recommendations.map(rec => rec.destination).join(', ');
  
  return `${plan.totalDestinations} destinos, ${totalNights} noches total: ${destinations}`;
};

export const getTotalHotelBudgetEstimate = (plan: AIHotelBookingPlan): string => {
  const avgNightlyRate = 120; // USD average per night
  const totalNights = plan.recommendations.reduce((sum, rec) => sum + rec.nights, 0);
  const estimatedTotal = totalNights * avgNightlyRate;
  
  return `$${estimatedTotal.toLocaleString()} USD aprox. (${totalNights} noches)`;
};
