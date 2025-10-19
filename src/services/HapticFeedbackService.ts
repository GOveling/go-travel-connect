import { Haptics, ImpactStyle } from '@capacitor/haptics';

export type HapticPattern = 
  | 'navigation_start' 
  | 'leg_complete' 
  | 'arrival_confirmed' 
  | 'turn_important' 
  | 'route_deviation' 
  | 'recalculation';

interface HapticConfig {
  pattern: ImpactStyle[];
  timing: number[];
}

class HapticFeedbackService {
  private static instance: HapticFeedbackService;
  private isEnabled: boolean = true;
  private isCapacitorAvailable: boolean = false;

  private hapticPatterns: Record<HapticPattern, HapticConfig> = {
    navigation_start: {
      pattern: [ImpactStyle.Medium],
      timing: [0]
    },
    leg_complete: {
      pattern: [ImpactStyle.Light, ImpactStyle.Medium],
      timing: [0, 200]
    },
    arrival_confirmed: {
      pattern: [ImpactStyle.Light, ImpactStyle.Medium, ImpactStyle.Heavy],
      timing: [0, 100, 300]
    },
    turn_important: {
      pattern: [ImpactStyle.Light],
      timing: [0]
    },
    route_deviation: {
      pattern: [ImpactStyle.Medium, ImpactStyle.Medium],
      timing: [0, 150]
    },
    recalculation: {
      pattern: [ImpactStyle.Heavy],
      timing: [0]
    }
  };

  private constructor() {
    this.checkCapacitorAvailability();
  }

  public static getInstance(): HapticFeedbackService {
    if (!HapticFeedbackService.instance) {
      HapticFeedbackService.instance = new HapticFeedbackService();
    }
    return HapticFeedbackService.instance;
  }

  private async checkCapacitorAvailability() {
    try {
      // Check if we're in a Capacitor environment
      this.isCapacitorAvailable = !!(window as any).Capacitor;
      
      if (this.isCapacitorAvailable) {
        // Check if haptics are available on this device
        await Haptics.impact({ style: ImpactStyle.Light });
      }
    } catch (error) {
      console.log('Haptics not available:', error);
      this.isCapacitorAvailable = false;
    }
  }

  public async trigger(pattern: HapticPattern, force: boolean = false): Promise<void> {
    if (!this.isEnabled && !force) return;
    if (!this.isCapacitorAvailable) {
      this.fallbackHaptic(pattern);
      return;
    }

    try {
      const config = this.hapticPatterns[pattern];
      
      for (let i = 0; i < config.pattern.length; i++) {
        if (i > 0) {
          await this.delay(config.timing[i] - config.timing[i - 1]);
        }
        
        await Haptics.impact({ style: config.pattern[i] });
      }
    } catch (error) {
      console.error('Error triggering haptic feedback:', error);
      this.fallbackHaptic(pattern);
    }
  }

  private fallbackHaptic(pattern: HapticPattern): void {
    // Fallback for web browsers that support vibration API
    if ('vibrate' in navigator) {
      const vibrationPattern = this.getVibrationPattern(pattern);
      navigator.vibrate(vibrationPattern);
    }
  }

  private getVibrationPattern(pattern: HapticPattern): number[] {
    switch (pattern) {
      case 'navigation_start': return [100];
      case 'leg_complete': return [50, 100, 150];
      case 'arrival_confirmed': return [50, 50, 100, 50, 200];
      case 'turn_important': return [50];
      case 'route_deviation': return [100, 100, 100];
      case 'recalculation': return [200];
      default: return [100];
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  public isHapticsEnabled(): boolean {
    return this.isEnabled;
  }

  public isHapticsAvailable(): boolean {
    return this.isCapacitorAvailable || 'vibrate' in navigator;
  }
}

export const hapticFeedbackService = HapticFeedbackService.getInstance();