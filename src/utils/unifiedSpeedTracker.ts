import { Position } from "@capacitor/geolocation";

interface SpeedReading {
  speed: number;
  timestamp: number;
  accuracy: number;
  confidence: number;
}

interface UnifiedSpeedConfig {
  maxAccuracy: number; // Maximum GPS accuracy to accept (meters)
  minTimeDelta: number; // Minimum time between readings (ms)
  maxTimeDelta: number; // Maximum time between readings (ms)
  maxRealisticSpeed: number; // Maximum realistic speed (m/s)
  bufferSize: number; // Number of readings to keep in buffer
  timeWindow: number; // Time window for calculations (ms)
  stationaryThreshold: number; // Speed below which considered stationary (m/s)
  walkingThreshold: number; // Speed below which considered walking (m/s)
}

const DEFAULT_CONFIG: UnifiedSpeedConfig = {
  maxAccuracy: 50, // 50m accuracy threshold
  minTimeDelta: 2000, // 2 seconds minimum
  maxTimeDelta: 60000, // 60 seconds maximum
  maxRealisticSpeed: 50, // 50 m/s (180 km/h) max realistic speed
  bufferSize: 5, // Keep last 5 readings
  timeWindow: 30000, // 30 second window
  stationaryThreshold: 1.0, // 1.0 m/s (3.6 km/h)
  walkingThreshold: 3.0, // 3.0 m/s (10.8 km/h)
};

/**
 * Unified Speed Tracker for consistent speed calculation across the app
 */
export class UnifiedSpeedTracker {
  private config: UnifiedSpeedConfig;
  private speedBuffer: SpeedReading[] = [];
  private lastPosition: Position | null = null;

  constructor(config: Partial<UnifiedSpeedConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Calculate distance between two coordinates using Haversine formula
   * Returns distance in meters
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
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

  /**
   * Validate GPS reading for speed calculation
   */
  private validateReading(currentPos: Position, previousPos?: Position): boolean {
    // Check basic position validity
    if (!currentPos?.coords) return false;

    // Check GPS accuracy
    if (currentPos.coords.accuracy > this.config.maxAccuracy) {
      console.log(`⚠️ Rejecting GPS reading with poor accuracy: ${currentPos.coords.accuracy}m > ${this.config.maxAccuracy}m`);
      return false;
    }

    // If we have a previous position, validate time delta
    if (previousPos) {
      const timeDelta = currentPos.timestamp - previousPos.timestamp;
      if (timeDelta < this.config.minTimeDelta) {
        console.log(`⚠️ Rejecting reading: time delta too small (${timeDelta}ms < ${this.config.minTimeDelta}ms)`);
        return false;
      }
      if (timeDelta > this.config.maxTimeDelta) {
        console.log(`⚠️ Rejecting reading: time delta too large (${timeDelta}ms > ${this.config.maxTimeDelta}ms)`);
        return false;
      }
    }

    return true;
  }

  /**
   * Calculate speed between two positions
   * Returns speed in m/s or null if invalid
   */
  private calculateRawSpeed(currentPos: Position, previousPos: Position): number | null {
    if (!this.validateReading(currentPos, previousPos)) {
      return null;
    }

    const distance = this.calculateDistance(
      previousPos.coords.latitude,
      previousPos.coords.longitude,
      currentPos.coords.latitude,
      currentPos.coords.longitude
    );

    const timeDelta = (currentPos.timestamp - previousPos.timestamp) / 1000; // seconds
    if (timeDelta <= 0) return null;

    const speed = distance / timeDelta; // m/s

    // Filter out unrealistic speeds
    if (speed > this.config.maxRealisticSpeed) {
      console.log(`⚠️ Rejecting unrealistic speed: ${speed.toFixed(2)} m/s (${(speed * 3.6).toFixed(1)} km/h)`);
      return null;
    }

    return speed;
  }

  /**
   * Add new position and update speed calculations
   * Returns the current smoothed speed in m/s
   */
  updatePosition(position: Position): number {
    // Validate the new reading
    if (!this.validateReading(position, this.lastPosition)) {
      return this.getCurrentSpeed(); // Return current speed without updating
    }

    // Calculate speed if we have a previous position
    if (this.lastPosition) {
      const rawSpeed = this.calculateRawSpeed(position, this.lastPosition);
      
      if (rawSpeed !== null) {
        // Calculate confidence based on GPS accuracy (better accuracy = higher confidence)
        const confidence = Math.max(0, 1 - (position.coords.accuracy / this.config.maxAccuracy));
        
        // Add to buffer
        this.speedBuffer.push({
          speed: rawSpeed,
          timestamp: position.timestamp,
          accuracy: position.coords.accuracy,
          confidence
        });

        // Clean old readings
        this.cleanBuffer();
        
        console.log(`🏃 Speed calculated: ${(rawSpeed * 3.6).toFixed(1)} km/h (${rawSpeed.toFixed(2)} m/s), accuracy: ${position.coords.accuracy.toFixed(1)}m, confidence: ${confidence.toFixed(2)}`);
      }
    }

    // Update last position
    this.lastPosition = position;
    
    return this.getCurrentSpeed();
  }

  /**
   * Remove old readings from buffer
   */
  private cleanBuffer() {
    const now = Date.now();
    
    // Remove readings outside time window
    this.speedBuffer = this.speedBuffer.filter(
      reading => (now - reading.timestamp) <= this.config.timeWindow
    );
    
    // Keep only the most recent readings if buffer is too large
    if (this.speedBuffer.length > this.config.bufferSize) {
      this.speedBuffer = this.speedBuffer.slice(-this.config.bufferSize);
    }
  }

  /**
   * Get current smoothed speed using weighted average
   * Returns speed in m/s
   */
  getCurrentSpeed(): number {
    if (this.speedBuffer.length === 0) return 0;

    // Use weighted average based on confidence and recency
    let totalWeight = 0;
    let weightedSum = 0;

    const now = Date.now();
    
    this.speedBuffer.forEach((reading, index) => {
      // Recent readings get higher weight
      const recencyWeight = (index + 1) / this.speedBuffer.length;
      
      // Higher confidence readings get higher weight
      const confidenceWeight = reading.confidence;
      
      // Combine weights
      const weight = recencyWeight * confidenceWeight;
      
      weightedSum += reading.speed * weight;
      totalWeight += weight;
    });

    const averageSpeed = totalWeight > 0 ? weightedSum / totalWeight : 0;
    
    return Math.max(0, averageSpeed); // Ensure non-negative
  }

  /**
   * Get current speed in km/h for display
   */
  getCurrentSpeedKmh(): number {
    return this.getCurrentSpeed() * 3.6;
  }

  /**
   * Check if user is currently stationary
   */
  isStationary(): boolean {
    return this.getCurrentSpeed() < this.config.stationaryThreshold;
  }

  /**
   * Check if user is walking
   */
  isWalking(): boolean {
    const speed = this.getCurrentSpeed();
    return speed >= this.config.stationaryThreshold && speed < this.config.walkingThreshold;
  }

  /**
   * Check if user is in vehicle (driving/cycling)
   */
  isInVehicle(): boolean {
    return this.getCurrentSpeed() >= this.config.walkingThreshold;
  }

  /**
   * Get movement classification
   */
  getMovementType(): 'stationary' | 'walking' | 'vehicle' {
    if (this.isStationary()) return 'stationary';
    if (this.isWalking()) return 'walking';
    return 'vehicle';
  }

  /**
   * Get debug information
   */
  getDebugInfo() {
    return {
      currentSpeed: this.getCurrentSpeed(),
      speedKmh: this.getCurrentSpeedKmh(),
      movementType: this.getMovementType(),
      bufferSize: this.speedBuffer.length,
      readings: this.speedBuffer.map(r => ({
        speed: r.speed,
        speedKmh: r.speed * 3.6,
        accuracy: r.accuracy,
        confidence: r.confidence,
        age: Date.now() - r.timestamp
      })),
      lastPosition: this.lastPosition ? {
        lat: this.lastPosition.coords.latitude,
        lng: this.lastPosition.coords.longitude,
        accuracy: this.lastPosition.coords.accuracy,
        timestamp: this.lastPosition.timestamp
      } : null,
      config: this.config
    };
  }

  /**
   * Reset the tracker
   */
  reset() {
    this.speedBuffer = [];
    this.lastPosition = null;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<UnifiedSpeedConfig>) {
    this.config = { ...this.config, ...newConfig };
  }
}

// Create and export a singleton instance
export const unifiedSpeedTracker = new UnifiedSpeedTracker();
