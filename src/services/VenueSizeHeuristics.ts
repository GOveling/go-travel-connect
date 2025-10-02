// Venue Size Heuristics - Smart arrival radius based on venue type and size

import { VenueSize, ClusterSuggestion } from '@/types/navigation';

interface VenueData {
  place_id?: string;
  name: string;
  category: string;
  types?: string[];
  location: { lat: number; lng: number };
  rating?: number;
  user_ratings_total?: number;
  vicinity?: string;
}

export class VenueSizeHeuristics {
  private static instance: VenueSizeHeuristics;
  private venueCache = new Map<string, VenueSize>();

  // Base radius by venue category (in meters)
  private readonly baseRadiusByCategory: Record<string, number> = {
    // Large venues
    'airport': 500,
    'shopping_mall': 200,
    'stadium': 300,
    'university': 200,
    'hospital': 150,
    'amusement_park': 300,
    'zoo': 200,
    'park': 150,
    
    // Medium venues  
    'museum': 100,
    'school': 100,
    'church': 80,
    'hotel': 80,
    'department_store': 100,
    'supermarket': 80,
    'train_station': 100,
    'subway_station': 50,
    'bus_station': 50,
    
    // Small venues
    'restaurant': 30,
    'cafe': 25,
    'bar': 30,
    'store': 25,
    'pharmacy': 25,
    'bank': 30,
    'gas_station': 40,
    'atm': 20,
    
    // Tiny venues
    'food': 20,
    'bakery': 20,
    'convenience_store': 20,
    'beauty_salon': 15,
    'laundry': 15,
    
    // Default
    'default': 50
  };

  // Keywords that indicate large venues
  private readonly largeVenueKeywords = [
    'mall', 'centro comercial', 'shopping', 'aeropuerto', 'airport',
    'estadio', 'stadium', 'universidad', 'university', 'hospital',
    'parque', 'park', 'museo', 'museum', 'plaza', 'centro',
    'mercado', 'market', 'terminal', 'station'
  ];

  // Keywords that indicate small venues  
  private readonly smallVenueKeywords = [
    'tienda', 'store', 'shop', 'cafe', 'restaurant', 'bar',
    'farmacia', 'pharmacy', 'banco', 'bank', 'atm', 'cajero'
  ];

  static getInstance(): VenueSizeHeuristics {
    if (!VenueSizeHeuristics.instance) {
      VenueSizeHeuristics.instance = new VenueSizeHeuristics();
    }
    return VenueSizeHeuristics.instance;
  }

  // Calculate arrival radius for a venue
  calculateArrivalRadius(venue: VenueData): VenueSize {
    const cacheKey = venue.place_id || `${venue.name}_${venue.location.lat}_${venue.location.lng}`;
    
    if (this.venueCache.has(cacheKey)) {
      return this.venueCache.get(cacheKey)!;
    }

    let baseRadius = this.getBaseRadius(venue);
    let confidence = 0.5;
    let venueType: VenueSize['venue_type'] = 'medium';

    // Analyze venue name for size indicators
    const nameAnalysis = this.analyzeVenueName(venue.name);
    baseRadius = Math.max(baseRadius, nameAnalysis.suggestedRadius);
    confidence = Math.max(confidence, nameAnalysis.confidence);

    // Analyze category/types
    const categoryAnalysis = this.analyzeCategoryTypes(venue);
    baseRadius = Math.max(baseRadius, categoryAnalysis.suggestedRadius);
    confidence = Math.max(confidence, categoryAnalysis.confidence);

    // Adjust based on rating and popularity (more popular = potentially larger)
    if (venue.user_ratings_total && venue.user_ratings_total > 1000) {
      baseRadius *= 1.3;
      confidence += 0.1;
    } else if (venue.user_ratings_total && venue.user_ratings_total > 100) {
      baseRadius *= 1.1;
      confidence += 0.05;
    }

    // Determine venue type
    if (baseRadius >= 200) {
      venueType = 'extra_large';
    } else if (baseRadius >= 100) {
      venueType = 'large';
    } else if (baseRadius >= 50) {
      venueType = 'medium';
    } else {
      venueType = 'small';
    }

    // Ensure reasonable bounds
    const finalRadius = Math.max(15, Math.min(500, Math.round(baseRadius)));
    const finalConfidence = Math.max(0.1, Math.min(1.0, confidence));

    const venueSize: VenueSize = {
      place_id: venue.place_id || cacheKey,
      category: venue.category,
      arrival_radius: finalRadius,
      venue_type: venueType,
      confidence: finalConfidence
    };

    this.venueCache.set(cacheKey, venueSize);
    
    console.log(`📏 Venue size calculated:`, {
      name: venue.name,
      category: venue.category,
      radius: `${finalRadius}m`,
      type: venueType,
      confidence: `${(finalConfidence * 100).toFixed(0)}%`
    });

    return venueSize;
  }

  // Get base radius from category
  private getBaseRadius(venue: VenueData): number {
    // Check exact category match
    if (this.baseRadiusByCategory[venue.category]) {
      return this.baseRadiusByCategory[venue.category];
    }

    // Check types array if available
    if (venue.types) {
      for (const type of venue.types) {
        if (this.baseRadiusByCategory[type]) {
          return this.baseRadiusByCategory[type];
        }
      }
    }

    return this.baseRadiusByCategory.default;
  }

  // Analyze venue name for size indicators
  private analyzeVenueName(name: string): { suggestedRadius: number; confidence: number } {
    const lowerName = name.toLowerCase();
    
    // Check for large venue indicators
    for (const keyword of this.largeVenueKeywords) {
      if (lowerName.includes(keyword)) {
        return { suggestedRadius: 150, confidence: 0.8 };
      }
    }

    // Check for small venue indicators
    for (const keyword of this.smallVenueKeywords) {
      if (lowerName.includes(keyword)) {
        return { suggestedRadius: 25, confidence: 0.7 };
      }
    }

    // Check for chain indicators (usually larger)
    const chainKeywords = ['mcdonalds', 'starbucks', 'walmart', 'costco', 'ikea'];
    for (const chain of chainKeywords) {
      if (lowerName.includes(chain)) {
        return { suggestedRadius: 80, confidence: 0.9 };
      }
    }

    return { suggestedRadius: 50, confidence: 0.3 };
  }

  // Analyze category and types
  private analyzeCategoryTypes(venue: VenueData): { suggestedRadius: number; confidence: number } {
    const allTypes = [venue.category, ...(venue.types || [])];
    
    for (const type of allTypes) {
      if (this.baseRadiusByCategory[type]) {
        return { 
          suggestedRadius: this.baseRadiusByCategory[type], 
          confidence: 0.8 
        };
      }
    }

    return { suggestedRadius: 50, confidence: 0.2 };
  }

  // Detect clusters of nearby venues
  detectVenueClusters(
    venues: VenueData[],
    maxClusterRadius = 200,
    minVenuesInCluster = 2
  ): ClusterSuggestion[] {
    
    const clusters: ClusterSuggestion[] = [];
    const processedVenues = new Set<string>();

    for (let i = 0; i < venues.length; i++) {
      const centerVenue = venues[i];
      const centerKey = centerVenue.place_id || `${centerVenue.name}_${i}`;
      
      if (processedVenues.has(centerKey)) continue;

      const clusterVenues: VenueData[] = [centerVenue];
      processedVenues.add(centerKey);

      // Find nearby venues
      for (let j = i + 1; j < venues.length; j++) {
        const otherVenue = venues[j];
        const otherKey = otherVenue.place_id || `${otherVenue.name}_${j}`;
        
        if (processedVenues.has(otherKey)) continue;

        const distance = this.calculateDistance(
          centerVenue.location.lat,
          centerVenue.location.lng,
          otherVenue.location.lat,
          otherVenue.location.lng
        );

        if (distance <= maxClusterRadius) {
          clusterVenues.push(otherVenue);
          processedVenues.add(otherKey);
        }
      }

      // Create cluster if it has enough venues
      if (clusterVenues.length >= minVenuesInCluster) {
        const cluster = this.createClusterSuggestion(clusterVenues);
        clusters.push(cluster);
      }
    }

    console.log(`🎯 Detected ${clusters.length} venue clusters`);
    return clusters;
  }

  // Create cluster suggestion
  private createClusterSuggestion(venues: VenueData[]): ClusterSuggestion {
    // Calculate cluster center
    const centerLat = venues.reduce((sum, v) => sum + v.location.lat, 0) / venues.length;
    const centerLng = venues.reduce((sum, v) => sum + v.location.lng, 0) / venues.length;

    // Calculate cluster radius (max distance from center)
    const radius = Math.max(...venues.map(venue => 
      this.calculateDistance(centerLat, centerLng, venue.location.lat, venue.location.lng)
    ));

    // Estimate visit times
    const totalEstimatedTime = venues.length * 30; // 30 min per venue estimate

    // Create optimized visiting order (simple: by distance from center)
    const sortedVenues = venues.sort((a, b) => {
      const distA = this.calculateDistance(centerLat, centerLng, a.location.lat, a.location.lng);
      const distB = this.calculateDistance(centerLat, centerLng, b.location.lat, b.location.lng);
      return distA - distB;
    });

    const cluster: ClusterSuggestion = {
      cluster_id: `cluster_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      places: venues.map(venue => ({
        id: venue.place_id || venue.name,
        name: venue.name,
        location: venue.location,
        category: venue.category,
        estimated_visit_duration: 30 // minutes
      })),
      center_location: { lat: centerLat, lng: centerLng },
      radius: Math.round(radius),
      estimated_total_time: totalEstimatedTime,
      recommended_order: sortedVenues.map(v => v.place_id || v.name),
      reason: this.generateClusterReason(venues)
    };

    return cluster;
  }

  // Generate reason for cluster suggestion
  private generateClusterReason(venues: VenueData[]): string {
    const categories = [...new Set(venues.map(v => v.category))];
    
    if (categories.length === 1) {
      return `Grupo de ${venues.length} ${categories[0]}s cercanos - visita eficiente en una zona`;
    } else if (categories.includes('restaurant') && categories.includes('shopping')) {
      return `Zona gastronómica y comercial - ideal para combinar comida y compras`;
    } else {
      return `Cluster de ${venues.length} lugares de interés cercanos - optimiza tu tiempo visitando la zona`;
    }
  }

  // Calculate distance between two points
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  // Get venue size info
  getVenueSize(place_id: string): VenueSize | null {
    return this.venueCache.get(place_id) || null;
  }

  // Clear cache
  clearCache(): void {
    this.venueCache.clear();
  }
}

export const venueSizeHeuristics = VenueSizeHeuristics.getInstance();