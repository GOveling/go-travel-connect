// Native Mobile Service - Capacitor integrations for mobile experience
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
// Note: Keep Awake functionality will be implemented with alternative approach
import { LocalNotifications } from '@capacitor/local-notifications';
import { isNative } from '@/utils/capacitor';

interface NativeMobileConfig {
  keepAwake: boolean;
  statusBarStyle: 'light' | 'dark';
  notificationsEnabled: boolean;
}

class NativeMobileService {
  private static instance: NativeMobileService;
  private config: NativeMobileConfig = {
    keepAwake: false,
    statusBarStyle: 'dark',
    notificationsEnabled: false
  };

  static getInstance(): NativeMobileService {
    if (!NativeMobileService.instance) {
      NativeMobileService.instance = new NativeMobileService();
    }
    return NativeMobileService.instance;
  }

  /**
   * Initialize native mobile features
   */
  async initialize(): Promise<void> {
    if (!isNative()) {
      console.log('🌐 Running in web mode - native features disabled');
      return;
    }

    try {
      // Request notification permissions
      await this.requestNotificationPermissions();
      
      console.log('📱 Native mobile service initialized');
    } catch (error) {
      console.error('❌ Error initializing native features:', error);
    }
  }

  /**
   * Enable navigation mode - keep screen awake, adjust status bar
   */
  async enableNavigationMode(): Promise<void> {
    if (!isNative()) return;

    try {
      // Keep screen awake during navigation (web fallback)
      if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
        try {
          // @ts-ignore - wakeLock is experimental
          await navigator.wakeLock.request('screen');
          this.config.keepAwake = true;
        } catch (error) {
          console.log('Wake lock not supported');
        }
      }

      // Dark status bar for better visibility
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#000000' });
      this.config.statusBarStyle = 'dark';

      console.log('🧭 Navigation mode enabled');
    } catch (error) {
      console.error('❌ Error enabling navigation mode:', error);
    }
  }

  /**
   * Disable navigation mode - allow screen sleep, restore status bar
   */
  async disableNavigationMode(): Promise<void> {
    if (!isNative()) return;

    try {
      // Allow screen to sleep (no action needed for web)
      this.config.keepAwake = false;

      // Restore default status bar
      await StatusBar.setStyle({ style: Style.Default });
      this.config.statusBarStyle = 'dark';

      console.log('🏁 Navigation mode disabled');
    } catch (error) {
      console.error('❌ Error disabling navigation mode:', error);
    }
  }

  /**
   * Send navigation notification
   */
  async sendNavigationNotification(title: string, body: string, isUrgent: boolean = false): Promise<void> {
    if (!isNative() || !this.config.notificationsEnabled) return;

    try {
      await LocalNotifications.schedule({
        notifications: [{
          title,
          body,
          id: Date.now(),
          smallIcon: 'ic_stat_navigation',
          iconColor: '#3b82f6',
          sound: isUrgent ? 'beep.wav' : undefined,
          // Note: vibrate not supported in current API
          ongoing: true, // Keep notification persistent during navigation
          extra: {
            type: 'navigation',
            urgent: isUrgent
          }
        }]
      });
    } catch (error) {
      console.error('❌ Error sending notification:', error);
    }
  }

  /**
   * Clear navigation notifications
   */
  async clearNavigationNotifications(): Promise<void> {
    if (!isNative()) return;

    try {
      const pending = await LocalNotifications.getPending();
      const navigationNotifications = pending.notifications.filter(
        n => n.extra?.type === 'navigation'
      );

      if (navigationNotifications.length > 0) {
        await LocalNotifications.cancel({
          notifications: navigationNotifications
        });
      }
    } catch (error) {
      console.error('❌ Error clearing notifications:', error);
    }
  }

  /**
   * Request notification permissions
   */
  private async requestNotificationPermissions(): Promise<void> {
    try {
      const permission = await LocalNotifications.requestPermissions();
      this.config.notificationsEnabled = permission.display === 'granted';
      
      if (this.config.notificationsEnabled) {
        console.log('✅ Notification permissions granted');
      } else {
        console.log('❌ Notification permissions denied');
      }
    } catch (error) {
      console.error('❌ Error requesting notification permissions:', error);
    }
  }

  /**
   * Get current configuration
   */
  getConfig(): NativeMobileConfig {
    return { ...this.config };
  }

  /**
   * Check if device supports native features
   */
  isNativeSupported(): boolean {
    return isNative();
  }
}

export const nativeMobileService = NativeMobileService.getInstance();
