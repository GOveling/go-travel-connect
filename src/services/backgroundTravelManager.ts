import { App } from '@capacitor/app';
import { Capacitor } from '@capacitor/core';
import { travelNotificationService } from './travelNotificationService';
import { unifiedSpeedTracker } from '../utils/unifiedSpeedTracker';

interface BackgroundTaskConfig {
  isEnabled: boolean;
  lastPosition: GeolocationPosition | null;
  intervalId: number | null;
  isInBackground: boolean;
  energyMode: 'normal' | 'saving' | 'ultra-saving';
}

class BackgroundTravelManager {
  private config: BackgroundTaskConfig = {
    isEnabled: false,
    lastPosition: null,
    intervalId: null,
    isInBackground: false,
    energyMode: 'normal'
  };

  private callbacks: {
    onLocationUpdate?: (position: GeolocationPosition) => void;
    onEnergyModeChange?: (mode: string) => void;
  } = {};

  async initialize() {
    if (!Capacitor.isNativePlatform()) {
      console.log('Background mode not available on web');
      return;
    }

    try {
      // For web platform, use service worker for background tasks
      if (!Capacitor.isNativePlatform()) {
        console.log('Using web-based background management');
        return;
      }
      
      // Note: Background mode plugin would be configured here
      // For now, we'll use the app state detection

      // Listen for app state changes
      App.addListener('appStateChange', ({ isActive }) => {
        this.config.isInBackground = !isActive;
        this.adjustEnergyMode();
      });

      console.log('Background travel manager initialized');
    } catch (error) {
      console.error('Failed to initialize background mode:', error);
    }
  }

  async startBackgroundTracking(callbacks: {
    onLocationUpdate?: (position: GeolocationPosition) => void;
    onEnergyModeChange?: (mode: string) => void;
  } = {}) {
    this.callbacks = callbacks;
    
    // Background mode would be enabled here for native platforms

    this.config.isEnabled = true;
    this.startLocationTracking();
  }

  async stopBackgroundTracking() {
    this.config.isEnabled = false;
    
    if (this.config.intervalId) {
      clearInterval(this.config.intervalId);
      this.config.intervalId = null;
    }

    // Background mode would be disabled here for native platforms
  }

  private startLocationTracking() {
    // Phase 2: Platform-optimized interval calculation
    const getInterval = () => {
      // Detect platform
      const isNative = Boolean((window as any).Capacitor?.isNativePlatform?.());
      
      // Platform-specific configurations - Intervalos más agresivos para mejor detección
      const config = {
        native: {
          minInterval: 3000, // 3s (reducido de 15s para mayor responsividad)
          maxInterval: 30000, // 30s (reducido de 60s)
          backgroundMultiplier: 2,
          foregroundMultiplier: 1,
        },
        web: {
          minInterval: 5000, // 5s (reducido de 20s)
          maxInterval: 45000, // 45s (reducido de 90s)
          backgroundMultiplier: 2.5,
          foregroundMultiplier: 1.2,
        }
      };
      
      const platformConfig = isNative ? config.native : config.web;
      
      const baseInterval = this.config.isInBackground ? 
        platformConfig.minInterval * platformConfig.backgroundMultiplier : 
        platformConfig.minInterval * platformConfig.foregroundMultiplier;
      
      // Adjust based on energy mode with platform considerations
      switch (this.config.energyMode) {
        case 'ultra-saving':
          return platformConfig.maxInterval;
        case 'saving':
          return Math.min(platformConfig.maxInterval, baseInterval * 1.5);
        default:
          return Math.max(platformConfig.minInterval, baseInterval);
      }
    };

    const trackLocation = () => {
      if (!this.config.isEnabled) return;

      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.config.lastPosition = position;
          this.callbacks.onLocationUpdate?.(position);
          
          // Adjust energy mode based on movement
          this.adjustEnergyModeByMovement(position);
        },
        (error) => {
          console.error('Background location error:', error);
        },
        {
          enableHighAccuracy: this.config.energyMode === 'normal',
          timeout: 10000,
          maximumAge: this.config.energyMode === 'ultra-saving' ? 60000 : 30000
        }
      );
    };

    // Initial tracking
    trackLocation();

    // Set up interval
    if (this.config.intervalId) {
      clearInterval(this.config.intervalId);
    }

    this.config.intervalId = setInterval(trackLocation, getInterval()) as unknown as number;
  }

  private adjustEnergyMode() {
    const previousMode = this.config.energyMode;
    
    if (this.config.isInBackground) {
      // More aggressive saving in background
      this.config.energyMode = 'saving';
    } else {
      this.config.energyMode = 'normal';
    }

    if (previousMode !== this.config.energyMode) {
      this.callbacks.onEnergyModeChange?.(this.config.energyMode);
      this.restartLocationTracking();
    }
  }

  private adjustEnergyModeByMovement(currentPosition: GeolocationPosition) {
    if (!this.config.lastPosition) return;

    // Convert to Capacitor Position format for unified tracker
    const capacitorPosition = {
      coords: {
        latitude: currentPosition.coords.latitude,
        longitude: currentPosition.coords.longitude,
        accuracy: currentPosition.coords.accuracy || 50,
        altitude: currentPosition.coords.altitude,
        altitudeAccuracy: currentPosition.coords.altitudeAccuracy,
        heading: currentPosition.coords.heading,
        speed: currentPosition.coords.speed,
      },
      timestamp: currentPosition.timestamp
    };

    // Use unified speed tracker
    const currentSpeed = unifiedSpeedTracker.updatePosition(capacitorPosition);
    const movementType = unifiedSpeedTracker.getMovementType();

    const timeDiff = currentPosition.timestamp - this.config.lastPosition.timestamp;

    // If user is stationary for extended period, switch to ultra-saving
    if (movementType === 'stationary' && timeDiff > 300000) { // stationary for 5 minutes
      if (this.config.energyMode !== 'ultra-saving') {
        this.config.energyMode = 'ultra-saving';
        this.callbacks.onEnergyModeChange?.(this.config.energyMode);
        this.restartLocationTracking();
      }
    }
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  private restartLocationTracking() {
    if (this.config.isEnabled) {
      this.startLocationTracking();
    }
  }

  getEnergyMode() {
    return this.config.energyMode;
  }

  isInBackground() {
    return this.config.isInBackground;
  }
}

export const backgroundTravelManager = new BackgroundTravelManager();