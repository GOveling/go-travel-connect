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

  /**
   * Initialize notification service
   */
  async initialize(): Promise<void> {
    try {
      // Request permissions
      const permissionResult = await LocalNotifications.requestPermissions();

      if (permissionResult.display !== "granted") {
        console.warn("Notification permissions not granted");
        return;
      }

      console.log("✅ Travel Notification Service initialized");
    } catch (error) {
      console.error("Error initializing notification service:", error);
    }
  }

  /**
   * Send proximity notification with smart deduplication
   */
  async sendProximityNotification(
    place: SavedPlace & { tripId: string; tripName: string },
    distance: number,
    threshold: number
  ): Promise<boolean> {
    try {
      // Create unique key for this notification
      const notificationKey = `${place.id}-${threshold}`;

      // Prevent duplicate notifications within 5 minutes
      if (this.sentNotifications.has(notificationKey)) {
        console.log(
          `Skipping duplicate notification for ${place.name} at ${threshold}m`
        );
        return false;
      }

      const distanceText = this.formatDistance(distance);
      const notificationId = Date.now();

      const notification: TravelNotification = {
        id: notificationId,
        title: this.getNotificationTitle(place, threshold),
        body: this.getNotificationBody(place, distanceText),
        data: {
          placeId: place.id,
          tripId: place.tripId,
          distance,
          threshold,
          timestamp: Date.now(),
        },
        scheduledAt: new Date(),
      };

      // Schedule the notification
      const result: ScheduleResult = await LocalNotifications.schedule({
        notifications: [
          {
            title: notification.title,
            body: notification.body,
            id: notification.id,
            schedule: { at: new Date() },
            extra: notification.data,
          },
        ],
      });

      // Track sent notification
      this.sentNotifications.add(notificationKey);
      this.notificationHistory.push(notification);

      // Clean up old entries after 5 minutes
      setTimeout(
        () => {
          this.sentNotifications.delete(notificationKey);
        },
        5 * 60 * 1000
      );

      console.log(
        `📱 Notification sent: ${place.name} at ${distanceText}`,
        result
      );

      return true;
    } catch (error) {
      console.error("Error sending proximity notification:", error);
      return false;
    }
  }

  /**
   * Send arrival notification when user reaches destination
   */
  async sendArrivalNotification(
    place: SavedPlace & { tripId: string; tripName: string }
  ): Promise<boolean> {
    try {
      const notificationId = Date.now();

      await LocalNotifications.schedule({
        notifications: [
          {
            title: `🎯 ¡Has llegado a ${place.name}!`,
            body: `Disfruta tu visita a ${place.name}. ¿Quieres marcarla como visitada?`,
            id: notificationId,
            schedule: { at: new Date() },
            extra: {
              placeId: place.id,
              tripId: place.tripId,
              type: "arrival",
              timestamp: Date.now(),
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
            id: Date.now(),
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
