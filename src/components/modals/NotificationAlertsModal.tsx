import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, MapPin, MessageSquare, Heart, UserPlus } from "lucide-react";
import NotificationHeader from "./notification-alerts/NotificationHeader";
import NotificationSection from "./notification-alerts/NotificationSection";
import NotificationEmptyState from "./notification-alerts/NotificationEmptyState";

interface NotificationAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notificationCount: number;
  onMarkAllRead: () => void;
}

interface NotificationAlert {
  id: string;
  type:
    | "friend_request"
    | "message"
    | "place_recommendation"
    | "like"
    | "comment"
    | "new_traveler";
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  icon: any;
  color: string;
}

const NotificationAlertsModal = ({
  isOpen,
  onClose,
  notificationCount,
  onMarkAllRead,
}: NotificationAlertsModalProps) => {
  const [notifications, setNotifications] = useState<NotificationAlert[]>([
    {
      id: "1",
      type: "friend_request",
      title: "New Friend Request",
      message: "Sarah Johnson wants to connect with you",
      time: "2 min ago",
      isRead: false,
      icon: UserPlus,
      color: "text-blue-600",
    },
    {
      id: "2",
      type: "message",
      title: "New Message",
      message: "Alex sent you a message about Tokyo trip",
      time: "15 min ago",
      isRead: false,
      icon: MessageSquare,
      color: "text-green-600",
    },
    {
      id: "3",
      type: "place_recommendation",
      title: "New Popular Place",
      message: "Mount Fuji is trending in your area",
      time: "1 hour ago",
      isRead: false,
      icon: MapPin,
      color: "text-purple-600",
    },
    {
      id: "4",
      type: "new_traveler",
      title: "New Traveler Nearby",
      message: "Mike is exploring Paris right now",
      time: "2 hours ago",
      isRead: false,
      icon: Users,
      color: "text-orange-600",
    },
    {
      id: "5",
      type: "like",
      title: "Trip Liked",
      message: "Emma liked your Paris adventure photos",
      time: "3 hours ago",
      isRead: false,
      icon: Heart,
      color: "text-red-600",
    },
    {
      id: "6",
      type: "comment",
      title: "New Comment",
      message: "John commented on your Santorini post",
      time: "1 day ago",
      isRead: true,
      icon: MessageSquare,
      color: "text-blue-600",
    },
  ]);

  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
    onMarkAllRead();
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const recentNotifications = notifications.slice(0, 3);
  const olderNotifications = notifications.slice(3);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto h-[90vh] flex flex-col p-0 overflow-hidden">
        <NotificationHeader
          unreadCount={unreadCount}
          onMarkAllRead={markAllAsRead}
        />

        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full">
            <div className="p-4 sm:p-6 space-y-4">
              <NotificationSection
                title="Recent"
                notifications={recentNotifications}
                onMarkAsRead={markAsRead}
              />

              <NotificationSection
                title="Earlier"
                notifications={olderNotifications}
                onMarkAsRead={markAsRead}
                showSeparator={olderNotifications.length > 0}
              />

              {notifications.length === 0 && <NotificationEmptyState />}
            </div>
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationAlertsModal;
