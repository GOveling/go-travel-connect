
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Bell,
  Users,
  MapPin,
  MessageSquare,
  Heart,
  UserPlus,
  Star,
  Camera,
  Clock
} from "lucide-react";

interface NotificationAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notificationCount: number;
  onMarkAllRead: () => void;
}

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

const NotificationAlertsModal = ({ isOpen, onClose, notificationCount, onMarkAllRead }: NotificationAlertsModalProps) => {
  const [notifications, setNotifications] = useState<NotificationAlert[]>([
    {
      id: '1',
      type: 'friend_request',
      title: 'New Friend Request',
      message: 'Sarah Johnson wants to connect with you',
      time: '2 min ago',
      isRead: false,
      icon: UserPlus,
      color: 'text-blue-600'
    },
    {
      id: '2',
      type: 'message',
      title: 'New Message',
      message: 'Alex sent you a message about Tokyo trip',
      time: '15 min ago',
      isRead: false,
      icon: MessageSquare,
      color: 'text-green-600'
    },
    {
      id: '3',
      type: 'place_recommendation',
      title: 'New Popular Place',
      message: 'Mount Fuji is trending in your area',
      time: '1 hour ago',
      isRead: false,
      icon: MapPin,
      color: 'text-purple-600'
    },
    {
      id: '4',
      type: 'new_traveler',
      title: 'New Traveler Nearby',
      message: 'Mike is exploring Paris right now',
      time: '2 hours ago',
      isRead: false,
      icon: Users,
      color: 'text-orange-600'
    },
    {
      id: '5',
      type: 'like',
      title: 'Trip Liked',
      message: 'Emma liked your Paris adventure photos',
      time: '3 hours ago',
      isRead: false,
      icon: Heart,
      color: 'text-red-600'
    },
    {
      id: '6',
      type: 'comment',
      title: 'New Comment',
      message: 'John commented on your Santorini post',
      time: '1 day ago',
      isRead: true,
      icon: MessageSquare,
      color: 'text-blue-600'
    }
  ]);

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    onMarkAllRead();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;
  const recentNotifications = notifications.slice(0, 3);
  const olderNotifications = notifications.slice(3);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell size={24} className="text-blue-600" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="h-5 w-5 flex items-center justify-center text-xs p-0">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              disabled={unreadCount === 0}
            >
              Mark all read
            </Button>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 pb-6">
            {/* Recent Notifications */}
            {recentNotifications.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent</h3>
                <div className="space-y-3">
                  {recentNotifications.map((notification) => {
                    const Icon = notification.icon;
                    return (
                      <div 
                        key={notification.id} 
                        className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${
                          !notification.isRead ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          !notification.isRead ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <Icon size={16} className={notification.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className={`text-sm font-medium ${
                                !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
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
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-1"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Separator */}
            {olderNotifications.length > 0 && <Separator />}

            {/* Older Notifications */}
            {olderNotifications.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Earlier</h3>
                <div className="space-y-3">
                  {olderNotifications.map((notification) => {
                    const Icon = notification.icon;
                    return (
                      <div 
                        key={notification.id} 
                        className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer hover:bg-gray-50 ${
                          !notification.isRead ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          !notification.isRead ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <Icon size={16} className={notification.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className={`text-sm font-medium ${
                                !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
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
                              <div className="w-2 h-2 bg-blue-600 rounded-full mt-1"></div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty state */}
            {notifications.length === 0 && (
              <div className="text-center py-8">
                <Bell size={48} className="text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No notifications yet</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationAlertsModal;
