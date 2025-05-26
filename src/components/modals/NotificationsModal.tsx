
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  MapPin, 
  Heart, 
  MessageSquare, 
  Camera, 
  CheckCheck, 
  X, 
  Check,
  Bell,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Notification {
  id: string;
  type: 'friend_request' | 'trip_like' | 'comment' | 'photo_tag' | 'travel_update' | 'achievement';
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionable?: boolean;
  user?: {
    name: string;
    avatar: string;
  };
}

const NotificationsModal = ({ isOpen, onClose }: NotificationsModalProps) => {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      type: 'friend_request',
      title: 'Friend Request',
      message: 'Sarah Johnson wants to connect with you',
      time: '5 minutes ago',
      read: false,
      actionable: true,
      user: { name: 'Sarah Johnson', avatar: 'SJ' }
    },
    {
      id: '2',
      type: 'trip_like',
      title: 'Trip Liked',
      message: 'Michael Brown liked your Paris trip',
      time: '1 hour ago',
      read: false,
      user: { name: 'Michael Brown', avatar: 'MB' }
    },
    {
      id: '3',
      type: 'comment',
      title: 'New Comment',
      message: 'Emma Wilson commented on your Rome photos',
      time: '2 hours ago',
      read: true,
      user: { name: 'Emma Wilson', avatar: 'EW' }
    },
    {
      id: '4',
      type: 'photo_tag',
      title: 'Photo Tag',
      message: 'You were tagged in a photo from Tokyo',
      time: '3 hours ago',
      read: true,
      user: { name: 'David Chen', avatar: 'DC' }
    },
    {
      id: '5',
      type: 'travel_update',
      title: 'Travel Update',
      message: 'Alex is currently in Barcelona - say hello!',
      time: '1 day ago',
      read: true,
      user: { name: 'Alex Rodriguez', avatar: 'AR' }
    },
    {
      id: '6',
      type: 'achievement',
      title: 'Achievement Unlocked',
      message: 'You earned the "City Explorer" badge!',
      time: '2 days ago',
      read: true
    }
  ]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'friend_request':
        return <User size={20} className="text-blue-600" />;
      case 'trip_like':
        return <Heart size={20} className="text-red-500" />;
      case 'comment':
        return <MessageSquare size={20} className="text-green-600" />;
      case 'photo_tag':
        return <Camera size={20} className="text-purple-600" />;
      case 'travel_update':
        return <MapPin size={20} className="text-orange-600" />;
      case 'achievement':
        return <CheckCheck size={20} className="text-yellow-600" />;
      default:
        return <Bell size={20} className="text-gray-600" />;
    }
  };

  const handleAcceptFriend = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    toast({
      title: "Friend request accepted",
      description: "You are now connected with this traveler",
    });
  };

  const handleDeclineFriend = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
    toast({
      title: "Friend request declined",
      description: "The request has been removed",
    });
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    toast({
      title: "All notifications marked as read",
    });
  };

  const clearAll = () => {
    setNotifications([]);
    toast({
      title: "All notifications cleared",
    });
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell size={24} className="text-blue-600" />
              <span>Notifications</span>
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2">
                  {unreadCount}
                </Badge>
              )}
            </div>
            <div className="flex space-x-2">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  Mark all read
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={clearAll}>
                Clear all
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 pb-6">
            {notifications.length === 0 ? (
              <div className="text-center py-8">
                <Bell size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">No notifications yet</p>
                <p className="text-sm text-gray-400">
                  Connect with travelers to see updates here
                </p>
              </div>
            ) : (
              notifications.map((notification, index) => (
                <div key={notification.id}>
                  <div 
                    className={`flex items-start space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      !notification.read 
                        ? 'bg-blue-50 hover:bg-blue-100' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex-shrink-0">
                      {notification.user ? (
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-orange-500 text-white text-sm">
                            {notification.user.avatar}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          {getNotificationIcon(notification.type)}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {notification.time}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="p-1 h-auto"
                          >
                            <Trash2 size={14} className="text-gray-400" />
                          </Button>
                        </div>
                      </div>

                      {notification.actionable && notification.type === 'friend_request' && (
                        <div className="flex space-x-2 mt-3">
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAcceptFriend(notification.id);
                            }}
                            className="bg-gradient-to-r from-blue-600 to-orange-500 text-white"
                          >
                            <Check size={14} className="mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeclineFriend(notification.id);
                            }}
                          >
                            <X size={14} className="mr-1" />
                            Decline
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  {index < notifications.length - 1 && <Separator className="my-2" />}
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationsModal;
