import { SavedPlace, Trip } from "@/types/aiSmartRoute";

export interface PlaceGroup {
  country: string;
  region: string;
  places: SavedPlace[];
  centerLat: number;
  centerLng: number;
}

export interface MultiDestinationAnalysis {
  isMultiDestination: boolean;
  groups: PlaceGroup[];
  suggestions: string[];
  recommendedTransportMode: 'walk' | 'drive' | 'transit' | 'bike';
  maxDistanceKm: number;
}

/**
 * Analyzes if a trip spans multiple destinations and groups places geographically
 */
export const analyzeMultiDestination = (trip: Trip): MultiDestinationAnalysis => {
  const places = trip.savedPlaces || [];
  
  if (places.length === 0) {
    return {
      isMultiDestination: false,
      groups: [],
      suggestions: [],
      recommendedTransportMode: 'walk',
      maxDistanceKm: 0
    };
  }

  // Group places by country/region
  const groups = groupPlacesByLocation(places);
  
  // Calculate distances between groups
  const maxDistance = calculateMaxDistanceBetweenGroups(groups);
  
  // Determine if multi-destination
  const isMultiDestination = groups.length > 1 || maxDistance > 50; // 50km threshold
  
  // Generate suggestions
  const suggestions = generateSuggestions(groups, maxDistance);
  
  // Recommend transport mode based on distances
  const recommendedTransportMode = getRecommendedTransportMode(maxDistance);

  return {
    isMultiDestination,
    groups,
    suggestions,
    recommendedTransportMode,
    maxDistanceKm: maxDistance
  };
};

/**
 * Groups places by their geographical location (country/region)
 */
const groupPlacesByLocation = (places: SavedPlace[]): PlaceGroup[] => {
  const groupMap = new Map<string, PlaceGroup>();

  places.forEach(place => {
    // Create a key based on country and region
    const country = place.country || extractCountryFromName(place.destinationName) || 'Unknown';
    const region = place.region || place.city || place.destinationName || 'Unknown';
    const key = `${country}-${region}`;

    if (!groupMap.has(key)) {
      groupMap.set(key, {
        country,
        region,
        places: [],
        centerLat: 0,
        centerLng: 0
      });
    }

    groupMap.get(key)!.places.push(place);
  });

  // Calculate center coordinates for each group
  return Array.from(groupMap.values()).map(group => {
    const validPlaces = group.places.filter(p => p.lat && p.lng);
    if (validPlaces.length > 0) {
      group.centerLat = validPlaces.reduce((sum, p) => sum + (p.lat || 0), 0) / validPlaces.length;
      group.centerLng = validPlaces.reduce((sum, p) => sum + (p.lng || 0), 0) / validPlaces.length;
    }
    return group;
  });
};

/**
 * Calculates maximum distance between any two place groups
 */
const calculateMaxDistanceBetweenGroups = (groups: PlaceGroup[]): number => {
  if (groups.length <= 1) return 0;

  let maxDistance = 0;
  for (let i = 0; i < groups.length; i++) {
    for (let j = i + 1; j < groups.length; j++) {
      const distance = calculateDistance(
        groups[i].centerLat, groups[i].centerLng,
        groups[j].centerLat, groups[j].centerLng
      );
      maxDistance = Math.max(maxDistance, distance);
    }
  }

  return maxDistance;
};

/**
 * Calculates distance between two points using Haversine formula
 */
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const toRadians = (degrees: number): number => degrees * (Math.PI / 180);

/**
 * Generates suggestions based on multi-destination analysis
 */
const generateSuggestions = (groups: PlaceGroup[], maxDistance: number): string[] => {
  const suggestions: string[] = [];

  if (groups.length > 1) {
    suggestions.push(`Tu viaje incluye ${groups.length} regiones diferentes: ${groups.map(g => `${g.region}, ${g.country}`).join('; ')}`);
    
    if (maxDistance > 100) {
      suggestions.push(`Distancia máxima entre destinos: ${Math.round(maxDistance)}km. Considera vuelos o transporte terrestre.`);
    } else if (maxDistance > 50) {
      suggestions.push(`Distancia entre destinos: ${Math.round(maxDistance)}km. Recomendado usar auto o transporte público.`);
    }

    if (groups.length > 3) {
      suggestions.push('Considera dividir tu viaje en múltiples rutas separadas para mejor optimización.');
    }
  }

  return suggestions;
};

/**
 * Recommends transport mode based on maximum distance
 */
const getRecommendedTransportMode = (maxDistance: number): 'walk' | 'drive' | 'transit' | 'bike' => {
  if (maxDistance > 50) return 'drive';
  if (maxDistance > 10) return 'transit';
  if (maxDistance > 3) return 'bike';
  return 'walk';
};

/**
 * Extracts country from destination name (simple heuristic)
 */
const extractCountryFromName = (destinationName: string): string | null => {
  if (!destinationName) return null;
  
  // Simple extraction - take the last part after comma
  const parts = destinationName.split(',').map(part => part.trim());
  if (parts.length > 1) {
    return parts[parts.length - 1];
  }
  
  return destinationName;
};

/**
 * Filters places that might be excluded by the API due to distance
 */
export const predictExcludedPlaces = (
  places: SavedPlace[], 
  transportMode: string, 
  maxDistance: number
): { included: SavedPlace[], excluded: SavedPlace[], reasons: string[] } => {
  if (places.length === 0) {
    return { included: [], excluded: [], reasons: [] };
  }

  // If single location or short distances, likely all included
  if (maxDistance <= 20) {
    return { included: places, excluded: [], reasons: [] };
  }

  // Group by location and predict exclusions
  const groups = groupPlacesByLocation(places);
  const reasons: string[] = [];
  
  if (groups.length > 1) {
    // If walking mode with long distances, some might be excluded
    if (transportMode === 'walk' && maxDistance > 10) {
      reasons.push('Algunos lugares pueden estar muy lejos para caminar');
    }
    
    if (groups.length > 3) {
      reasons.push('Demasiados destinos dispersos para optimización automática');
    }
  }

  // For now, return all as included but with warnings
  return { 
    included: places, 
    excluded: [], 
    reasons 
  };
};