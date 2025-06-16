
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

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

interface NotificationItemProps {
  notification: NotificationAlert;
  onMarkAsRead: (id: string) => void;
}

const NotificationItem = ({ notification, onMarkAsRead }: NotificationItemProps) => {
  const Icon = notification.icon;

  return (
    <div 
      className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
        !notification.isRead ? 'bg-blue-50' : ''
      }`}
      onClick={() => onMarkAsRead(notification.id)}
    >
      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
        !notification.isRead ? 'bg-blue-100' : 'bg-gray-100'
      }`}>
        <Icon size={14} className={notification.color} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium truncate ${
              !notification.isRead ? 'text-gray-900' : 'text-gray-700'
            }`}>
              {notification.title}
            </p>
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">
              {notification.message}
            </p>
            <div className="flex items-center space-x-1 mt-2">
              <Clock size={12} className="text-gray-400" />
              <span className="text-xs text-gray-500">
                {notification.time}
              </span>
            </div>
          </div>
          {!notification.isRead && (
            <div className="w-2 h-2 bg-blue-600 rounded-full mt-1 ml-2 flex-shrink-0"></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
