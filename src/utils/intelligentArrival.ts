import { SavedPlace } from '@/types';

interface ArrivalHistoryData {
  placeId: string;
  placeName: string;
  category: string;
  confirmedDistance: number;
  userSpeed: number;
  timestamp: number;
}

interface RadiusLearningData {
  category: string;
  confirmedDistances: number[];
  averageDistance: number;
  lastUpdated: number;
}

class IntelligentArrivalManager {
  private readonly STORAGE_KEY = 'travel_arrival_learning';
  private readonly MAX_HISTORY_ENTRIES = 1000;
  private readonly LEARNING_THRESHOLD = 5; // Minimum confirmations before adjustment

  private learningData: Map<string, RadiusLearningData> = new Map();

  constructor() {
    this.loadLearningData();
  }

  /**
   * Record a confirmed arrival for learning
   */
  recordConfirmedArrival(
    place: SavedPlace,
    confirmedDistance: number,
    userSpeed: number
  ) {
    const category = place.category || 'other';
    const historyEntry: ArrivalHistoryData = {
      placeId: place.id,
      placeName: place.name,
      category,
      confirmedDistance,
      userSpeed,
      timestamp: Date.now()
    };

    // Update category learning data
    const existing = this.learningData.get(category);
    if (existing) {
      existing.confirmedDistances.push(confirmedDistance);
      // Keep only recent confirmations (max 50 per category)
      if (existing.confirmedDistances.length > 50) {
        existing.confirmedDistances = existing.confirmedDistances.slice(-50);
      }
      existing.averageDistance = this.calculateWeightedAverage(existing.confirmedDistances);
      existing.lastUpdated = Date.now();
    } else {
      this.learningData.set(category, {
        category,
        confirmedDistances: [confirmedDistance],
        averageDistance: confirmedDistance,
        lastUpdated: Date.now()
      });
    }

    this.saveLearningData();
    console.log(`📊 Recorded arrival: ${place.name} (${category}) at ${confirmedDistance}m`);
  }

  /**
   * Get intelligent radius for a place based on category and historical data
   */
  getIntelligentRadius(
    place: SavedPlace,
    userSpeed: number,
    baseRadius: number = 50
  ): number {
    const category = place.category || 'other';
    const learningData = this.learningData.get(category);

    let adjustedRadius = baseRadius;

    // Apply category-specific learning
    if (learningData && learningData.confirmedDistances.length >= this.LEARNING_THRESHOLD) {
      const learnedRadius = learningData.averageDistance;
      // Blend learned radius with base radius (70% learned, 30% base)
      adjustedRadius = Math.round(learnedRadius * 0.7 + baseRadius * 0.3);
    }

    // Apply speed-based adjustment
    const speedMultiplier = this.getSpeedMultiplier(userSpeed);
    adjustedRadius = Math.round(adjustedRadius * speedMultiplier);

    // Apply category-specific constraints
    const constrainedRadius = this.applyCategoryConstraints(category, adjustedRadius);

    console.log(`🎯 Intelligent radius for ${place.name}: ${constrainedRadius}m (base: ${baseRadius}m, learned: ${learningData?.averageDistance || 'none'}, speed: ${userSpeed}m/s)`);

    return constrainedRadius;
  }

  /**
   * Check if arrival should be confirmed based on multiple factors
   */
  shouldConfirmArrival(
    place: SavedPlace,
    currentDistance: number,
    userSpeed: number,
    dwellTime: number = 0
  ): {
    confirmed: boolean;
    confidence: number;
    radius: number;
    reasons: string[];
  } {
    const radius = this.getIntelligentRadius(place, userSpeed);
    const reasons: string[] = [];
    let confidence = 0;

    // Distance check
    const withinRadius = currentDistance <= radius;
    if (withinRadius) {
      confidence += 0.4;
      reasons.push(`Within ${radius}m radius`);
    }

    // Speed check (slower = higher confidence)
    if (userSpeed < 1.0) { // Walking or stationary
      confidence += 0.3;
      reasons.push('Slow movement (walking/stationary)');
    } else if (userSpeed < 3.0) { // Slow walking
      confidence += 0.2;
      reasons.push('Walking pace');
    }

    // Dwell time check
    if (dwellTime > 30000) { // 30 seconds
      confidence += 0.2;
      reasons.push('Sufficient dwell time');
    } else if (dwellTime > 10000) { // 10 seconds
      confidence += 0.1;
      reasons.push('Some dwell time');
    }

    // Category-specific confidence adjustments
    const categoryBonus = this.getCategoryConfidenceBonus(place.category || 'other');
    confidence += categoryBonus;

    const confirmed = confidence >= 0.6 && withinRadius;

    return {
      confirmed,
      confidence: Math.min(confidence, 1.0),
      radius,
      reasons
    };
  }

  /**
   * Handle contiguous POIs (nearby places)
   */
  resolveContiguousPOIs(
    places: (SavedPlace & { distance: number })[],
    userHeading: number | null = null
  ): SavedPlace & { distance: number } | null {
    if (places.length <= 1) return places[0] || null;

    // Sort by distance first
    const sortedPlaces = [...places].sort((a, b) => a.distance - b.distance);
    
    // If distances are very close (< 20m difference), use heading
    const closest = sortedPlaces[0];
    const nearbyPlaces = sortedPlaces.filter(p => 
      Math.abs(p.distance - closest.distance) < 20
    );

    if (nearbyPlaces.length > 1 && userHeading !== null) {
      // Calculate which place is most aligned with user's heading
      // For now, return the closest one, but this could be enhanced
      // with actual bearing calculations
      console.log('🧭 Multiple nearby places detected, resolving by proximity');
    }

    return closest;
  }

  private calculateWeightedAverage(distances: number[]): number {
    if (distances.length === 0) return 0;
    
    // Give more weight to recent confirmations
    const weights = distances.map((_, index) => {
      const recencyWeight = (index + 1) / distances.length;
      return recencyWeight;
    });

    const weightedSum = distances.reduce((sum, distance, index) => {
      return sum + (distance * weights[index]);
    }, 0);

    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    
    return Math.round(weightedSum / totalWeight);
  }

  private getSpeedMultiplier(speedMs: number): number {
    // Adjust radius based on speed to account for GPS drift
    if (speedMs < 0.5) return 1.0; // Stationary
    if (speedMs < 2.0) return 1.1; // Walking
    if (speedMs < 8.0) return 1.3; // Cycling/jogging
    return 1.5; // Driving
  }

  private applyCategoryConstraints(category: string, radius: number): number {
    const constraints = {
      'restaurant': { min: 15, max: 80 },
      'hotel': { min: 30, max: 150 },
      'museum': { min: 40, max: 200 },
      'park': { min: 50, max: 300 },
      'airport': { min: 100, max: 500 },
      'stadium': { min: 100, max: 400 },
      'shopping': { min: 20, max: 100 },
      'attraction': { min: 30, max: 150 },
      'transport': { min: 20, max: 100 },
      'other': { min: 10, max: 100 }
    };

    const constraint = constraints[category] || constraints['other'];
    return Math.max(constraint.min, Math.min(constraint.max, radius));
  }

  private getCategoryConfidenceBonus(category: string): number {
    const bonuses = {
      'restaurant': 0.1, // Usually precise locations
      'hotel': 0.15, // Large buildings, easier to detect
      'museum': 0.1,
      'park': -0.05, // Large areas, less precise
      'airport': 0.2, // Very large, clear boundaries
      'stadium': 0.15,
      'shopping': 0.1,
      'attraction': 0.05,
      'transport': 0.1,
      'other': 0.0
    };

    return bonuses[category] || 0.0;
  }

  private loadLearningData() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        this.learningData = new Map(Object.entries(data));
      }
    } catch (error) {
      console.warn('Failed to load arrival learning data:', error);
    }
  }

  private saveLearningData() {
    try {
      const data = Object.fromEntries(this.learningData);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save arrival learning data:', error);
    }
  }

  /**
   * Get learning statistics for debugging
   */
  getLearningStats(): { [category: string]: RadiusLearningData } {
    return Object.fromEntries(this.learningData);
  }

  /**
   * Clear all learning data (for testing or reset)
   */
  clearLearningData() {
    this.learningData.clear();
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('🧹 Cleared all arrival learning data');
  }
}

export const intelligentArrivalManager = new IntelligentArrivalManager();
