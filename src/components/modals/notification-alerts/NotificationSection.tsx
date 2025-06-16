
import { Separator } from "@/components/ui/separator";
import NotificationItem from "./NotificationItem";

interface NotificationAlert {
  id: string;
  type: 'friend_request' | 'message' | 'place_recommendation' | 'like' | 'comment' | 'new_traveler';
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  icon: any;
  color: string;
}

interface NotificationSectionProps {
  title: string;
  notifications: NotificationAlert[];
  onMarkAsRead: (id: string) => void;
  showSeparator?: boolean;
}

const NotificationSection = ({ title, notifications, onMarkAsRead, showSeparator = false }: NotificationSectionProps) => {
  if (notifications.length === 0) return null;

  return (
    <>
      {showSeparator && <Separator />}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">{title}</h3>
        <div className="space-y-3">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={onMarkAsRead}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default NotificationSection;
