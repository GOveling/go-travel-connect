
// AI protocol for determining optimal flight timing based on distance and travel logistics

interface Location {
  name: string;
  lat?: number;
  lng?: number;
}

// Calculate distance between two points using Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Get approximate coordinates for major cities (simplified lookup)
const getCityCoordinates = (cityName: string): { lat: number; lng: number } | null => {
  const cityMap: { [key: string]: { lat: number; lng: number } } = {
    'New York, NY': { lat: 40.7128, lng: -74.0060 },
    'Los Angeles, CA': { lat: 34.0522, lng: -118.2437 },
    'London': { lat: 51.5074, lng: -0.1278 },
    'Paris': { lat: 48.8566, lng: 2.3522 },
    'Tokyo': { lat: 35.6762, lng: 139.6503 },
    'Rome': { lat: 41.9028, lng: 12.4964 },
    'Barcelona': { lat: 41.3851, lng: 2.1734 },
    'Amsterdam': { lat: 52.3676, lng: 4.9041 },
    'Berlin': { lat: 52.5200, lng: 13.4050 },
    'Madrid': { lat: 40.4168, lng: -3.7038 },
    'Sydney': { lat: -33.8688, lng: 151.2093 },
    'Dubai': { lat: 25.2048, lng: 55.2708 },
    'Singapore': { lat: 1.3521, lng: 103.8198 },
    'Hong Kong': { lat: 22.3193, lng: 114.1694 },
    'Bangkok': { lat: 13.7563, lng: 100.5018 },
    'Mumbai': { lat: 19.0760, lng: 72.8777 },
    'São Paulo': { lat: -23.5505, lng: -46.6333 },
    'Mexico City': { lat: 19.4326, lng: -99.1332 },
    'Toronto': { lat: 43.6532, lng: -79.3832 },
    'Vancouver': { lat: 49.2827, lng: -123.1207 }
  };

  // Try exact match first
  if (cityMap[cityName]) {
    return cityMap[cityName];
  }

  // Try partial match for city names
  const cityKeys = Object.keys(cityMap);
  for (const key of cityKeys) {
    if (key.toLowerCase().includes(cityName.toLowerCase()) || 
        cityName.toLowerCase().includes(key.toLowerCase())) {
      return cityMap[key];
    }
  }

  return null;
};

export interface FlightTimingRecommendation {
  shouldDepartDayBefore: boolean;
  reason: string;
  aiConfidence: 'high' | 'medium' | 'low';
  estimatedFlightDuration: string;
  distance: number;
}

export const getAIFlightTimingRecommendation = (
  currentLocation: string, 
  firstDestination: string,
  itineraryStartDate: string
): FlightTimingRecommendation => {
  console.log('🤖 AI Flight Timing Analysis:', {
    from: currentLocation,
    to: firstDestination,
    startDate: itineraryStartDate
  });

  const currentCoords = getCityCoordinates(currentLocation);
  const destCoords = getCityCoordinates(firstDestination);

  // Default recommendation if coordinates not found
  if (!currentCoords || !destCoords) {
    return {
      shouldDepartDayBefore: false,
      reason: 'Coordenadas no disponibles. Recomendación conservadora para vuelo el mismo día.',
      aiConfidence: 'low',
      estimatedFlightDuration: '2-8 horas',
      distance: 0
    };
  }

  const distance = calculateDistance(
    currentCoords.lat, currentCoords.lng,
    destCoords.lat, destCoords.lng
  );

  console.log('🌍 Distance calculated:', distance, 'km');

  // AI Logic based on distance and travel logistics
  let shouldDepartDayBefore = false;
  let reason = '';
  let confidence: 'high' | 'medium' | 'low' = 'medium';
  let estimatedDuration = '';

  if (distance < 500) {
    // Short distance - domestic or regional
    shouldDepartDayBefore = false;
    reason = 'Vuelo corto (< 500km). Vuelo el mismo día permite mejor aprovechamiento del tiempo.';
    confidence = 'high';
    estimatedDuration = '1-2 horas';
  } else if (distance < 2000) {
    // Medium distance - continental
    shouldDepartDayBefore = false;
    reason = 'Distancia media (500-2000km). Vuelo matutino el mismo día es óptimo.';
    confidence = 'high';
    estimatedDuration = '2-4 horas';
  } else if (distance < 5000) {
    // Long distance - intercontinental short
    shouldDepartDayBefore = true;
    reason = 'Vuelo largo (2000-5000km). Día anterior evita jet lag y permite descanso.';
    confidence = 'medium';
    estimatedDuration = '4-8 horas';
  } else if (distance < 10000) {
    // Very long distance - major intercontinental
    shouldDepartDayBefore = true;
    reason = 'Vuelo muy largo (5000-10000km). Día anterior esencial para adaptación horaria.';
    confidence = 'high';
    estimatedDuration = '8-15 horas';
  } else {
    // Extreme distance - around the world
    shouldDepartDayBefore = true;
    reason = 'Vuelo extremadamente largo (>10000km). Día anterior + día de descanso recomendado.';
    confidence = 'high';
    estimatedDuration = '15+ horas';
  }

  const recommendation = {
    shouldDepartDayBefore,
    reason,
    aiConfidence: confidence,
    estimatedFlightDuration: estimatedDuration,
    distance: Math.round(distance)
  };

  console.log('🤖 AI Recommendation:', recommendation);
  
  return recommendation;
};

export const adjustFlightDateBasedOnAI = (
  itineraryStartDate: string,
  recommendation: FlightTimingRecommendation
): string => {
  if (!recommendation.shouldDepartDayBefore) {
    return itineraryStartDate;
  }

  // Calculate the day before
  const startDate = new Date(itineraryStartDate);
  const dayBefore = new Date(startDate);
  dayBefore.setDate(startDate.getDate() - 1);
  
  // Format as YYYY-MM-DD
  return dayBefore.toISOString().split('T')[0];
};
