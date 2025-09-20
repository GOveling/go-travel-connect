// Device motion for native platforms would be imported here
import { Capacitor } from '@capacitor/core';

interface CompassData {
  heading: number; // 0-360 degrees
  accuracy: number;
  timestamp: number;
}

interface DirectionalGuidance {
  targetBearing: number;
  currentHeading: number;
  turnDirection: 'left' | 'right' | 'straight';
  turnAngle: number;
  distance: number;
  guidanceText: string;
}

class CompassService {
  private watchId: string | null = null;
  private currentHeading: number = 0;
  private callbacks: ((data: CompassData) => void)[] = [];
  private isWatching: boolean = false;

  async initialize(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) {
      console.log('Device motion not available on web platform');
      return false;
    }

    try {
      // For native platforms, device motion permissions would be requested here
      // For web, check if device orientation is available
      if ('DeviceOrientationEvent' in window) {
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to initialize compass:', error);
      return false;
    }
  }

  async startWatching(callback: (data: CompassData) => void) {
    if (!Capacitor.isNativePlatform()) {
      // Fallback for web - use device orientation API if available
      return this.startWebCompass(callback);
    }

    try {
      this.callbacks.push(callback);
      
      if (!this.isWatching) {
        // For native platforms, device motion listener would be added here
        // For now, fallback to web compass
        return this.startWebCompass(callback);
      }
    } catch (error) {
      console.error('Failed to start compass watching:', error);
    }
  }

  private startWebCompass(callback: (data: CompassData) => void): boolean {
    if ('DeviceOrientationEvent' in window) {
      const handleOrientation = (event: DeviceOrientationEvent) => {
        if (event.alpha !== null) {
          const compassData: CompassData = {
            heading: this.normalizeHeading(event.alpha),
            accuracy: 0,
            timestamp: Date.now()
          };
          
          this.currentHeading = compassData.heading;
          callback(compassData);
        }
      };

      window.addEventListener('deviceorientation', handleOrientation);
      this.callbacks.push(callback);
      return true;
    }
    return false;
  }

  stopWatching() {
    if (this.watchId && Capacitor.isNativePlatform()) {
      // Device motion listeners would be removed here
    }
    
    this.watchId = null;
    this.isWatching = false;
    this.callbacks = [];
  }

  private normalizeHeading(alpha: number): number {
    // Convert alpha to compass bearing (0 = North, 90 = East, etc.)
    let heading = 360 - alpha;
    if (heading >= 360) heading -= 360;
    if (heading < 0) heading += 360;
    return Math.round(heading);
  }

  calculateBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const φ1 = lat1 * Math.PI / 180;
    const φ2 = lat2 * Math.PI / 180;
    const Δλ = (lon2 - lon1) * Math.PI / 180;

    const x = Math.sin(Δλ) * Math.cos(φ2);
    const y = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

    const θ = Math.atan2(x, y);
    return (θ * 180 / Math.PI + 360) % 360;
  }

  getDirectionalGuidance(
    userLat: number,
    userLon: number,
    targetLat: number,
    targetLon: number,
    distance: number
  ): DirectionalGuidance {
    const targetBearing = this.calculateBearing(userLat, userLon, targetLat, targetLon);
    const bearingDiff = this.calculateBearingDifference(this.currentHeading, targetBearing);
    
    let turnDirection: 'left' | 'right' | 'straight';
    let guidanceText: string;
    
    if (Math.abs(bearingDiff) <= 10) {
      turnDirection = 'straight';
      guidanceText = `Continue straight for ${Math.round(distance)}m`;
    } else if (bearingDiff > 0) {
      turnDirection = 'right';
      guidanceText = `Turn ${Math.round(Math.abs(bearingDiff))}° right - ${Math.round(distance)}m`;
    } else {
      turnDirection = 'left';
      guidanceText = `Turn ${Math.round(Math.abs(bearingDiff))}° left - ${Math.round(distance)}m`;
    }

    return {
      targetBearing,
      currentHeading: this.currentHeading,
      turnDirection,
      turnAngle: Math.abs(bearingDiff),
      distance,
      guidanceText
    };
  }

  private calculateBearingDifference(current: number, target: number): number {
    let diff = target - current;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return diff;
  }

  getCurrentHeading(): number {
    return this.currentHeading;
  }

  getCardinalDirection(heading: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(heading / 45) % 8;
    return directions[index];
  }
}

export const compassService = new CompassService();