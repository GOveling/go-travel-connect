import { Capacitor } from '@capacitor/core';
import { Geolocation, type Position } from '@capacitor/geolocation';

export interface ActivityData {
  activity: 'stationary' | 'walking' | 'cycling' | 'driving' | 'unknown';
  confidence: number;
  timestamp: number;
  steps?: number;
  stepRate?: number; // steps per minute
}

export interface ActivityDetectionConfig {
  enabled: boolean;
  updateInterval: number; // milliseconds
  confidenceThreshold: number; // 0-1
}

class ActivityDetectionService {
  private isListening = false;
  private currentActivity: ActivityData = {
    activity: 'unknown',
    confidence: 0,
    timestamp: Date.now()
  };
  private callbacks: ((activity: ActivityData) => void)[] = [];
  private config: ActivityDetectionConfig = {
    enabled: true,
    updateInterval: 5000, // 5 seconds
    confidenceThreshold: 0.6
  };
  private lastStepCount = 0;
  private lastStepTime = Date.now();
  private intervalId?: NodeJS.Timeout;

  async initialize(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      console.log('Activity detection not available on web platform');
      return false;
    }

    try {
      // Check permissions for location (used for activity inference)
      const permission = await Geolocation.checkPermissions();
      if (permission.location !== 'granted') {
        console.warn('Location permission needed for activity detection');
        return false;
      }

      console.log('Activity detection service initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize activity detection:', error);
      return false;
    }
  }

  async startDetection(): Promise<void> {
    if (this.isListening || !this.config.enabled) return;

    const initialized = await this.initialize();
    if (!initialized) return;

    this.isListening = true;
    this.startLocationBasedDetection();
    console.log('Activity detection started');
  }

  stopDetection(): void {
    if (!this.isListening) return;

    this.isListening = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    console.log('Activity detection stopped');
  }

  private async startLocationBasedDetection(): Promise<void> {
    if (!Capacitor.isNativePlatform()) return;

    let previousPosition: Position | null = null;
    let previousTime = Date.now();

    this.intervalId = setInterval(async () => {
      try {
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: false, // Use low accuracy for battery saving
          timeout: 10000,
          maximumAge: 5000
        });

        const currentTime = Date.now();
        
        if (previousPosition) {
          // Calculate speed and movement patterns
          const distance = this.calculateHaversineDistance(
            previousPosition.coords.latitude,
            previousPosition.coords.longitude,
            position.coords.latitude,
            position.coords.longitude
          );
          
          const timeDiff = (currentTime - previousTime) / 1000; // seconds
          const speed = timeDiff > 0 ? distance / timeDiff : 0; // m/s
          
          // Classify activity based on speed and movement patterns
          const activity = this.classifyActivityFromMovement(speed, position.coords.accuracy);
          
          this.currentActivity = {
            activity: activity.type,
            confidence: activity.confidence,
            timestamp: currentTime
          };

          // Notify callbacks if confidence is high enough
          if (activity.confidence >= this.config.confidenceThreshold) {
            this.notifyCallbacks(this.currentActivity);
          }
        }

        previousPosition = position;
        previousTime = currentTime;

      } catch (error) {
        console.error('Error getting location for activity detection:', error);
        // Fallback to unknown activity
        this.currentActivity = {
          activity: 'unknown',
          confidence: 0,
          timestamp: Date.now()
        };
        this.notifyCallbacks(this.currentActivity);
      }
    }, this.config.updateInterval);
  }

  private classifyActivityFromMovement(speedMs: number, accuracy: number): { type: ActivityData['activity'], confidence: number } {
    const speedKmh = speedMs * 3.6;
    
    // Reduce confidence if GPS accuracy is poor
    let baseConfidence = accuracy < 20 ? 0.8 : accuracy < 50 ? 0.6 : 0.4;
    
    // Classification based on speed patterns
    if (speedKmh < 1) {
      return { type: 'stationary', confidence: baseConfidence * 0.9 };
    } else if (speedKmh >= 1 && speedKmh < 8) {
      return { type: 'walking', confidence: baseConfidence * 0.85 };
    } else if (speedKmh >= 8 && speedKmh < 25) {
      return { type: 'cycling', confidence: baseConfidence * 0.75 };
    } else if (speedKmh >= 25) {
      return { type: 'driving', confidence: baseConfidence * 0.8 };
    }
    
    return { type: 'unknown', confidence: 0.3 };
  }

  private notifyCallbacks(activity: ActivityData): void {
    this.callbacks.forEach(callback => {
      try {
        callback(activity);
      } catch (error) {
        console.error('Error in activity detection callback:', error);
      }
    });
  }

  getCurrentActivity(): ActivityData {
    return this.currentActivity;
  }

  onActivityUpdate(callback: (activity: ActivityData) => void): () => void {
    this.callbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index > -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }

  updateConfig(newConfig: Partial<ActivityDetectionConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart detection if interval changed and we're currently listening
    if (this.isListening && newConfig.updateInterval) {
      this.stopDetection();
      this.startDetection();
    }
  }

  getConfig(): ActivityDetectionConfig {
    return { ...this.config };
  }

  isSupported(): boolean {
    return Capacitor.isNativePlatform();
  }

  isActive(): boolean {
    return this.isListening;
  }

  // Utility method to get intelligent interval based on detected activity
  getIntelligentInterval(baseInterval: number): number {
    const activity = this.getCurrentActivity();
    
    if (activity.confidence < this.config.confidenceThreshold) {
      return baseInterval; // Use base interval if confidence is low
    }

    switch (activity.activity) {
      case 'stationary':
        return Math.min(baseInterval * 3, 60000); // Up to 60s for stationary
      case 'walking':
        return Math.max(baseInterval * 0.8, 8000); // Minimum 8s for walking
      case 'cycling':
        return Math.max(baseInterval * 0.6, 5000); // Minimum 5s for cycling
      case 'driving':
        return Math.max(baseInterval * 0.4, 3000); // Minimum 3s for driving
      default:
        return baseInterval;
    }
  }

  // Get battery optimization factor based on activity
  getBatteryOptimizationFactor(): number {
    const activity = this.getCurrentActivity();
    
    switch (activity.activity) {
      case 'stationary':
        return 0.3; // Very low power for stationary
      case 'walking':
        return 0.7; // Medium power for walking
      case 'cycling':
      case 'driving':
        return 1.0; // Full power for fast movement
      default:
        return 0.8; // Default conservative approach
    }
  }

  // Haversine distance calculation
  private calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}

export const activityDetectionService = new ActivityDetectionService();