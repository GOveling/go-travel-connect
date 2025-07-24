// AI protocol for determining optimal flight timing based on distance and travel logistics

interface Location {
  name: string;
  lat?: number;
  lng?: number;
}

// Calculate distance between two points using Haversine formula
const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Enhanced city coordinates database
const getCityCoordinates = (
  cityName: string
): { lat: number; lng: number } | null => {
  const cityMap: { [key: string]: { lat: number; lng: number } } = {
    "New York, NY": { lat: 40.7128, lng: -74.006 },
    "New York": { lat: 40.7128, lng: -74.006 },
    "Los Angeles, CA": { lat: 34.0522, lng: -118.2437 },
    "Los Angeles": { lat: 34.0522, lng: -118.2437 },
    London: { lat: 51.5074, lng: -0.1278 },
    Paris: { lat: 48.8566, lng: 2.3522 },
    Tokyo: { lat: 35.6762, lng: 139.6503 },
    Rome: { lat: 41.9028, lng: 12.4964 },
    Barcelona: { lat: 41.3851, lng: 2.1734 },
    Amsterdam: { lat: 52.3676, lng: 4.9041 },
    Berlin: { lat: 52.52, lng: 13.405 },
    Madrid: { lat: 40.4168, lng: -3.7038 },
    Sydney: { lat: -33.8688, lng: 151.2093 },
    Dubai: { lat: 25.2048, lng: 55.2708 },
    Singapore: { lat: 1.3521, lng: 103.8198 },
    "Hong Kong": { lat: 22.3193, lng: 114.1694 },
    Bangkok: { lat: 13.7563, lng: 100.5018 },
    Mumbai: { lat: 19.076, lng: 72.8777 },
    "São Paulo": { lat: -23.5505, lng: -46.6333 },
    "Mexico City": { lat: 19.4326, lng: -99.1332 },
    Toronto: { lat: 43.6532, lng: -79.3832 },
    Vancouver: { lat: 49.2827, lng: -123.1207 },
    Miami: { lat: 25.7617, lng: -80.1918 },
    Chicago: { lat: 41.8781, lng: -87.6298 },
    "San Francisco": { lat: 37.7749, lng: -122.4194 },
    "Las Vegas": { lat: 36.1699, lng: -115.1398 },
    Boston: { lat: 42.3601, lng: -71.0589 },
    Seattle: { lat: 47.6062, lng: -122.3321 },
    Montreal: { lat: 45.5017, lng: -73.5673 },
    Vienna: { lat: 48.2082, lng: 16.3738 },
    Prague: { lat: 50.0755, lng: 14.4378 },
    Budapest: { lat: 47.4979, lng: 19.0402 },
    Athens: { lat: 37.9838, lng: 23.7275 },
    Istanbul: { lat: 41.0082, lng: 28.9784 },
    Cairo: { lat: 30.0444, lng: 31.2357 },
    "Cape Town": { lat: -33.9249, lng: 18.4241 },
    "Buenos Aires": { lat: -34.6118, lng: -58.396 },
    "Rio de Janeiro": { lat: -22.9068, lng: -43.1729 },
    Lima: { lat: -12.0464, lng: -77.0428 },
    Bogotá: { lat: 4.711, lng: -74.0721 },
  };

  // Try exact match first
  if (cityMap[cityName]) {
    return cityMap[cityName];
  }

  // Try partial match for city names
  const normalizedInput = cityName.toLowerCase().trim();
  const cityKeys = Object.keys(cityMap);

  for (const key of cityKeys) {
    const normalizedKey = key.toLowerCase();
    if (
      normalizedKey.includes(normalizedInput) ||
      normalizedInput.includes(normalizedKey)
    ) {
      return cityMap[key];
    }
  }

  // Try without country codes
  const cleanCityName = cityName.replace(/,.*$/, "").trim();
  for (const key of cityKeys) {
    const cleanKey = key.replace(/,.*$/, "").trim();
    if (cleanKey.toLowerCase() === cleanCityName.toLowerCase()) {
      return cityMap[key];
    }
  }

  return null;
};

export interface FlightTimingRecommendation {
  shouldDepartDayBefore: boolean;
  reason: string;
  aiConfidence: "high" | "medium" | "low";
  estimatedFlightDuration: string;
  distance: number;
  timeZoneDifference?: number;
  jetLagFactor?: "low" | "medium" | "high";
}

export const getAIFlightTimingRecommendation = (
  currentLocation: string,
  firstDestination: string,
  itineraryStartDate: string
): FlightTimingRecommendation => {
  console.log("🤖 AI Flight Timing Analysis:", {
    from: currentLocation,
    to: firstDestination,
    startDate: itineraryStartDate,
  });

  const currentCoords = getCityCoordinates(currentLocation);
  const destCoords = getCityCoordinates(firstDestination);

  // Default recommendation if coordinates not found
  if (!currentCoords || !destCoords) {
    console.log("⚠️ Coordinates not found, using conservative recommendation");
    return {
      shouldDepartDayBefore: false,
      reason:
        "Coordenadas no disponibles. Recomendación conservadora para vuelo el mismo día.",
      aiConfidence: "low",
      estimatedFlightDuration: "2-8 horas",
      distance: 0,
      jetLagFactor: "low",
    };
  }

  const distance = calculateDistance(
    currentCoords.lat,
    currentCoords.lng,
    destCoords.lat,
    destCoords.lng
  );

  console.log("🌍 Distance calculated:", distance, "km");

  // Enhanced AI Logic based on distance, time zones, and travel logistics
  let shouldDepartDayBefore = false;
  let reason = "";
  let confidence: "high" | "medium" | "low" = "medium";
  let estimatedDuration = "";
  let jetLagFactor: "low" | "medium" | "high" = "low";

  // Calculate approximate time zone difference (simplified)
  const lngDiff = Math.abs(destCoords.lng - currentCoords.lng);
  const timeZoneDifference = Math.round(lngDiff / 15); // Rough estimate

  if (distance < 500) {
    // Short distance - domestic or regional
    shouldDepartDayBefore = false;
    reason =
      "Vuelo corto (< 500km). Vuelo el mismo día permite mejor aprovechamiento del tiempo.";
    confidence = "high";
    estimatedDuration = "1-2 horas";
    jetLagFactor = "low";
  } else if (distance < 1500) {
    // Medium distance - continental short
    shouldDepartDayBefore = false;
    reason =
      "Distancia media (500-1500km). Vuelo matutino el mismo día es óptimo.";
    confidence = "high";
    estimatedDuration = "2-3 horas";
    jetLagFactor = "low";
  } else if (distance < 3000) {
    // Medium-long distance - continental
    if (timeZoneDifference > 3) {
      shouldDepartDayBefore = true;
      reason =
        "Vuelo continental largo (1500-3000km) con diferencia horaria significativa. Día anterior recomendado.";
    } else {
      shouldDepartDayBefore = false;
      reason =
        "Vuelo continental (1500-3000km). Vuelo temprano el mismo día es viable.";
    }
    confidence = "high";
    estimatedDuration = "3-6 horas";
    jetLagFactor = timeZoneDifference > 3 ? "medium" : "low";
  } else if (distance < 6000) {
    // Long distance - intercontinental short
    shouldDepartDayBefore = true;
    reason =
      "Vuelo largo (3000-6000km). Día anterior evita jet lag y permite descanso antes del itinerario.";
    confidence = "high";
    estimatedDuration = "6-10 horas";
    jetLagFactor = "medium";
  } else if (distance < 10000) {
    // Very long distance - major intercontinental
    shouldDepartDayBefore = true;
    reason =
      "Vuelo muy largo (6000-10000km). Día anterior esencial para adaptación horaria y descanso.";
    confidence = "high";
    estimatedDuration = "10-15 horas";
    jetLagFactor = "high";
  } else {
    // Extreme distance - around the world
    shouldDepartDayBefore = true;
    reason =
      "Vuelo extremadamente largo (>10000km). Día anterior + día de adaptación recomendado para jet lag severo.";
    confidence = "high";
    estimatedDuration = "15+ horas";
    jetLagFactor = "high";
  }

  const recommendation: FlightTimingRecommendation = {
    shouldDepartDayBefore,
    reason,
    aiConfidence: confidence,
    estimatedFlightDuration: estimatedDuration,
    distance: Math.round(distance),
    timeZoneDifference,
    jetLagFactor,
  };

  console.log("🤖 AI Flight Recommendation:", recommendation);

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
  return dayBefore.toISOString().split("T")[0];
};

// Additional utility for multi-city optimization
export const getOptimalMultiCityFlightTiming = (
  locations: string[],
  startDate: string,
  daysPerDestination: number = 3
): { from: string; to: string; departDate: string; aiOptimized: boolean }[] => {
  const flights: {
    from: string;
    to: string;
    departDate: string;
    aiOptimized: boolean;
  }[] = [];

  for (let i = 0; i < locations.length - 1; i++) {
    const from = locations[i];
    const to = locations[i + 1];

    // Calculate departure date for this segment
    const segmentDate = new Date(startDate);
    segmentDate.setDate(segmentDate.getDate() + i * daysPerDestination);

    // Get AI recommendation for this segment
    const recommendation = getAIFlightTimingRecommendation(
      from,
      to,
      segmentDate.toISOString().split("T")[0]
    );
    const optimizedDate = adjustFlightDateBasedOnAI(
      segmentDate.toISOString().split("T")[0],
      recommendation
    );

    flights.push({
      from,
      to,
      departDate: optimizedDate,
      aiOptimized: recommendation.shouldDepartDayBefore,
    });
  }

  return flights;
};
