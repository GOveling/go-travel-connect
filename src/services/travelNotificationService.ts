import {
  LocalNotifications,
  ScheduleResult,
} from "@capacitor/local-notifications";
import { SavedPlace } from "../types";

interface NotificationData {
  placeId: string;
  tripId: string;
  distance: number;
  threshold: number;
  timestamp: number;
}

interface TravelNotification {
  id: number;
  title: string;
  body: string;
  data: NotificationData;
  scheduledAt: Date;
}

class TravelNotificationService {
  private notificationHistory: TravelNotification[] = [];
  private sentNotifications: Set<string> = new Set();
  private lastNotificationTime: Map<string, number> = new Map();

  /**
   * Initialize notification service
   */
  async initialize(): Promise<boolean> {
    try {
      console.log("🔧 Initializing Travel Notification Service...");

      // Request permissions
      const permissionResult = await LocalNotifications.requestPermissions();

      console.log("📱 Notification permission result:", permissionResult);
      console.log("📱 Display permission:", permissionResult.display);

      if (permissionResult.display !== "granted") {
        console.warn("❌ Notification permissions not granted");
        console.warn("📱 Current permission status:", permissionResult);
        return false;
      }

      console.log("✅ Travel Notification Service initialized successfully");
      return true;
    } catch (error) {
      console.error("❌ Error initializing notification service:", error);
      return false;
    }
  }

  /**
   * Send welcome notification when Travel Mode is activated
   */
  async sendCustomWelcomeNotification(): Promise<boolean> {
    try {
      console.log("📱 Enviando notificación de bienvenida del Travel Mode");

      const notificationId = Date.now();
      // Add 1 second to ensure it's in the future
      const scheduleTime = new Date(Date.now() + 1000);

      const result: ScheduleResult = await LocalNotifications.schedule({
        notifications: [
          {
            title: "🧭 Travel Mode Activado",
            body: "¡Perfecto! Ahora recibirás notificaciones cuando estés cerca de lugares interesantes durante tu viaje.",
            id: notificationId,
            schedule: { at: scheduleTime },
            extra: {
              type: "welcome",
              timestamp: Date.now(),
            },
          },
        ],
      });

      console.log("✅ Welcome notification scheduled:", result);
      return true;
    } catch (error) {
      console.error("❌ Error sending welcome notification:", error);
      return false;
    }
  }

  /**
   * Clear all notification tracking (useful when restarting Travel Mode)
   */
  clearNotificationTracking(): void {
    console.log("🧹 Clearing all notification tracking state...");
    this.sentNotifications.clear();
    this.lastNotificationTime.clear();
    console.log("✅ Notification tracking state cleared");
  }

  /**
   * Send proximity notification with robust deduplication
   */
  async sendProximityNotification(
    place: SavedPlace & { tripId: string; tripName: string },
    distance: number,
    threshold: number
  ): Promise<boolean> {
    try {
      console.log(`📱 ===== PROXIMITY NOTIFICATION ATTEMPT =====`);
      console.log(`Place: ${place.name}`);
      console.log(`Distance: ${distance.toFixed(0)}m`);
      console.log(`Threshold: ${threshold}m`);

      // Create unique key
      const notificationKey = `${place.id}-${threshold}`;
      const now = Date.now();

      console.log(`🔑 Notification key: ${notificationKey}`);

      // Check if we already sent this notification recently (within 3 minutes - reduced time)
      const lastSent = this.lastNotificationTime.get(notificationKey);
      if (lastSent && now - lastSent < 3 * 60 * 1000) {
        console.log(
          `🔄 Skipping duplicate notification for ${place.name} at ${threshold}m (sent ${Math.round((now - lastSent) / 1000)}s ago)`
        );
        return false;
      }

      console.log(`✅ Notification checks passed, proceeding to send...`);

      const distanceText = this.formatDistance(distance);
      const notificationId = Math.floor(Date.now() + Math.random() * 1000); // Ensure unique INTEGER ID

      console.log(`🆔 Generated notification ID: ${notificationId}`);

      const notification: TravelNotification = {
        id: notificationId,
        title: this.getNotificationTitle(place, threshold),
        body: this.getNotificationBody(place, distanceText),
        data: {
          placeId: place.id,
          tripId: place.tripId,
          distance,
          threshold,
          timestamp: now,
        },
        scheduledAt: new Date(),
      };

      console.log(`📝 Notification content:`);
      console.log(`   Title: ${notification.title}`);
      console.log(`   Body: ${notification.body}`);

      // Schedule the notification FIRST
      const scheduleTime = new Date(now + 1000); // Add 1 second to ensure it's in the future
      console.log(
        `⏰ Scheduling notification for: ${scheduleTime.toISOString()}`
      );

      const result: ScheduleResult = await LocalNotifications.schedule({
        notifications: [
          {
            title: notification.title,
            body: notification.body,
            id: notification.id,
            schedule: { at: scheduleTime },
            extra: notification.data,
          },
        ],
      });

      console.log(`📱 LocalNotifications.schedule result:`, result);

      // Only mark as sent AFTER successful scheduling
      if (result && result.notifications && result.notifications.length > 0) {
        this.sentNotifications.add(notificationKey);
        this.lastNotificationTime.set(notificationKey, now);
        this.notificationHistory.push(notification);

        console.log(`✅ Marked as sent after successful scheduling`);

        // Clean up old entries after 5 minutes (reduced time)
        setTimeout(
          () => {
            this.sentNotifications.delete(notificationKey);
            this.lastNotificationTime.delete(notificationKey);
            console.log(
              `🧹 Cleaned up notification tracking for ${notificationKey}`
            );
          },
          5 * 60 * 1000
        );

        console.log(
          `📱 ✅ Notification sent successfully: ${place.name} at ${distanceText} (threshold: ${threshold}m)`
        );

        return true;
      } else {
        console.error(
          `❌ Failed to schedule notification - invalid result:`,
          result
        );
        return false;
      }
    } catch (error) {
      console.error("❌ Error sending proximity notification:", error);
      return false;
    }
  }

  /**
   * Send arrival notification when user reaches destination (less than 10m)
   */
  async sendArrivalNotification(
    place: SavedPlace & { tripId: string; tripName: string }
  ): Promise<boolean> {
    try {
      const notificationKey = `${place.id}-arrival`;
      const now = Date.now();

      // Check if we already sent arrival notification recently (within 10 minutes)
      const lastSent = this.lastNotificationTime.get(notificationKey);
      if (lastSent && now - lastSent < 10 * 60 * 1000) {
        console.log(
          `🔄 Skipping duplicate arrival notification for ${place.name}`
        );
        return false;
      }

      const notificationId = Math.floor(now + Math.random() * 1000); // Ensure unique INTEGER ID

      // Mark as sent BEFORE scheduling
      this.lastNotificationTime.set(notificationKey, now);
      this.sentNotifications.add(notificationKey);

      await LocalNotifications.schedule({
        notifications: [
          {
            title: `🎯 ¡Has llegado a ${place.name}!`,
            body: `Bienvenido a ${place.name}. ¡Disfruta tu visita!`,
            id: notificationId,
            schedule: { at: new Date(now + 1000) },
            extra: {
              placeId: place.id,
              tripId: place.tripId,
              type: "arrival",
              timestamp: now,
            },
          },
        ],
      });

      console.log(`🎯 Arrival notification sent for ${place.name}`);
      return true;
    } catch (error) {
      console.error("Error sending arrival notification:", error);
      return false;
    }
  }

  /**
   * Send travel summary notification
   */
  async sendTravelSummary(
    visitedPlaces: number,
    totalDistance: number,
    travelTime: number
  ): Promise<void> {
    try {
      const hours = Math.floor(travelTime / 3600);
      const minutes = Math.floor((travelTime % 3600) / 60);
      const timeText = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

      await LocalNotifications.schedule({
        notifications: [
          {
            title: "📊 Resumen de tu viaje",
            body: `Visitaste ${visitedPlaces} lugares, recorriste ${this.formatDistance(totalDistance)} en ${timeText}`,
            id: Math.floor(Date.now() + Math.random() * 1000), // Ensure unique INTEGER ID
            schedule: { at: new Date() },
            extra: {
              type: "travel_summary",
              visitedPlaces,
              totalDistance,
              travelTime,
              timestamp: Date.now(),
            },
          },
        ],
      });

      console.log("📊 Travel summary notification sent");
    } catch (error) {
      console.error("Error sending travel summary:", error);
    }
  }

  /**
   * Get smart notification title based on context
   */
  private getNotificationTitle(place: SavedPlace, threshold: number): string {
    if (threshold <= 100) {
      return `🎯 ¡Ya casi llegas a ${place.name}!`;
    } else if (threshold <= 500) {
      return `📍 Te acercas a ${place.name}`;
    } else {
      return `🗺️ ${place.name} está cerca`;
    }
  }

  /**
   * Get smart notification body with contextual information
   */
  private getNotificationBody(
    place: SavedPlace & { tripName: string },
    distanceText: string
  ): string {
    const priority = place.priority === "high" ? "⭐ " : "";
    const time = place.estimatedTime ? ` (${place.estimatedTime})` : "";

    return `${priority}Estás a ${distanceText} de ${place.name} en "${place.tripName}"${time}`;
  }

  /**
   * Format distance for display
   */
  private formatDistance(distance: number): string {
    if (distance >= 1000) {
      return `${(distance / 1000).toFixed(1)}km`;
    }
    return `${Math.round(distance)}m`;
  }

  /**
   * Clear all pending notifications
   */
  async clearAllNotifications(): Promise<void> {
    try {
      await LocalNotifications.cancel({ notifications: [] });
      this.sentNotifications.clear();
      this.notificationHistory = [];
      console.log("🧹 All travel notifications cleared");
    } catch (error) {
      console.error("Error clearing notifications:", error);
    }
  }

  /**
   * Get notification history
   */
  getNotificationHistory(): TravelNotification[] {
    return [...this.notificationHistory];
  }

  /**
   * Clean up old notifications from history
   */
  cleanupHistory(maxAge: number = 24 * 60 * 60 * 1000): void {
    const cutoff = Date.now() - maxAge;
    this.notificationHistory = this.notificationHistory.filter(
      (notification) => notification.data.timestamp > cutoff
    );
  }
}

// Export singleton instance
export const travelNotificationService = new TravelNotificationService();
