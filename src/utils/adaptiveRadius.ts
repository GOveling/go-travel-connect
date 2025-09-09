/**
 * Adaptive radius calculation for place visit confirmation
 * Solves the issue of large venues (malls, airports, universities) having fixed 10m radius
 */

interface PlaceRadiusConfig {
  category: string;
  radius: number;
  keywords: string[];
}

// Category-based radius configurations
const CATEGORY_RADII: PlaceRadiusConfig[] = [
  // Very large venues (200-500m)
  { category: 'airport', radius: 300, keywords: ['airport', 'aeropuerto', 'terminal'] },
  { category: 'university', radius: 250, keywords: ['university', 'universidad', 'college', 'campus'] },
  { category: 'stadium', radius: 400, keywords: ['stadium', 'estadio', 'arena', 'coliseum'] },
  { category: 'park', radius: 200, keywords: ['park', 'parque', 'nacional', 'national'] },
  { category: 'theme_park', radius: 500, keywords: ['theme park', 'parque temático', 'disney', 'universal'] },
  
  // Large venues (75-150m)
  { category: 'shopping_mall', radius: 150, keywords: ['mall', 'shopping', 'centro comercial', 'plaza'] },
  { category: 'hospital', radius: 100, keywords: ['hospital', 'clinic', 'clínica', 'medical center'] },
  { category: 'supermarket', radius: 80, keywords: ['supermarket', 'supermercado', 'walmart', 'costco', 'hypermarket'] },
  { category: 'market', radius: 80, keywords: ['market', 'mercado', 'bazaar', 'feria'] },
  { category: 'convention_center', radius: 120, keywords: ['convention', 'convención', 'centro de convenciones', 'expo'] },
  
  // Medium venues (25-50m)
  { category: 'museum', radius: 40, keywords: ['museum', 'museo', 'gallery', 'galería'] },
  { category: 'church', radius: 35, keywords: ['church', 'iglesia', 'cathedral', 'catedral', 'temple', 'templo'] },
  { category: 'hotel', radius: 30, keywords: ['hotel', 'resort', 'hostel', 'lodge'] },
  { category: 'school', radius: 50, keywords: ['school', 'escuela', 'colegio', 'institute', 'instituto'] },
  { category: 'gym', radius: 30, keywords: ['gym', 'gimnasio', 'fitness', 'sports center'] },
  
  // Small venues (10-20m) - default for most places
  { category: 'restaurant', radius: 15, keywords: ['restaurant', 'restaurante', 'cafe', 'cafetería'] },
  { category: 'store', radius: 15, keywords: ['store', 'tienda', 'shop', 'boutique'] },
  { category: 'bar', radius: 12, keywords: ['bar', 'pub', 'tavern', 'taberna'] },
  { category: 'gas_station', radius: 20, keywords: ['gas station', 'gasolinera', 'petrol', 'combustible'] },
];

// Default radius for places without specific category
const DEFAULT_RADIUS = 15; // meters

/**
 * Calculate adaptive radius for place visit confirmation
 * @param place - The saved place object
 * @returns radius in meters
 */
export const getAdaptiveVisitRadius = (place: {
  name?: string;
  category?: string;
  types?: string[];
  description?: string;
}): number => {
  if (!place) return DEFAULT_RADIUS;

  const placeName = (place.name || '').toLowerCase();
  const placeCategory = (place.category || '').toLowerCase();
  const placeDescription = (place.description || '').toLowerCase();
  const placeTypes = place.types || [];
  
  // Combine all text fields for keyword search
  const searchText = `${placeName} ${placeCategory} ${placeDescription} ${placeTypes.join(' ')}`.toLowerCase();

  console.log(`🎯 Calculating adaptive radius for: "${place.name}"`);
  console.log(`   📝 Search text: "${searchText}"`);
  console.log(`   🏷️ Category: "${placeCategory}"`);

  // Check each category configuration
  for (const config of CATEGORY_RADII) {
    // First check if category matches
    if (placeCategory.includes(config.category)) {
      console.log(`   ✅ Category match: ${config.category} -> ${config.radius}m`);
      return config.radius;
    }

    // Then check keywords in all text fields
    const hasKeywordMatch = config.keywords.some(keyword => 
      searchText.includes(keyword.toLowerCase())
    );

    if (hasKeywordMatch) {
      const matchedKeyword = config.keywords.find(keyword => 
        searchText.includes(keyword.toLowerCase())
      );
      console.log(`   ✅ Keyword match: "${matchedKeyword}" -> ${config.category} -> ${config.radius}m`);
      return config.radius;
    }
  }

  console.log(`   🎯 No specific match found, using default radius: ${DEFAULT_RADIUS}m`);
  return DEFAULT_RADIUS;
};

/**
 * Get proximity thresholds with adaptive arrival radius
 * @param place - The saved place object
 * @returns object with near, far and arrival thresholds
 */
export const getAdaptiveProximityThresholds = (place: {
  name?: string;
  category?: string;
  types?: string[];
  description?: string;
}) => {
  const arrivalRadius = getAdaptiveVisitRadius(place);
  
  // Calculate proportional thresholds based on arrival radius
  // For larger venues, we need proportionally larger "near" and "far" thresholds
  const nearThreshold = Math.max(15, Math.round(arrivalRadius * 0.5)); // At least 15m, or 50% of arrival radius
  const farThreshold = Math.max(25, Math.round(arrivalRadius * 0.75)); // At least 25m, or 75% of arrival radius
  
  return {
    NEAR_THRESHOLD: nearThreshold,
    FAR_THRESHOLD: farThreshold,
    ARRIVAL_THRESHOLD: arrivalRadius,
  };
};

/**
 * Log adaptive radius information for debugging
 */
export const logAdaptiveRadiusInfo = (place: any, thresholds: any) => {
  console.log(`🎯 Adaptive Radius for "${place.name}":`);
  console.log(`   📏 Near: ${thresholds.NEAR_THRESHOLD}m`);
  console.log(`   📏 Far: ${thresholds.FAR_THRESHOLD}m`);
  console.log(`   📏 Arrival: ${thresholds.ARRIVAL_THRESHOLD}m`);
  console.log(`   🏷️ Category: ${place.category || 'none'}`);
};