
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { 
  Bell,
  BellRing,
  Shield,
  Eye,
  EyeOff,
  Globe,
  Users,
  MapPin,
  Camera,
  MessageSquare,
  Heart,
  Award
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
  icon: any;
  category: 'social' | 'travel' | 'privacy';
}

const NotificationsModal = ({ isOpen, onClose }: NotificationsModalProps) => {
  const { toast } = useToast();
  
  const [settings, setSettings] = useState<NotificationSetting[]>([
    // Social Notifications
    {
      id: 'friend_requests',
      title: 'Friend Requests',
      description: 'Get notified when someone wants to connect',
      enabled: true,
      icon: Users,
      category: 'social'
    },
    {
      id: 'trip_likes',
      title: 'Trip Likes',
      description: 'When someone likes your trips or photos',
      enabled: true,
      icon: Heart,
      category: 'social'
    },
    {
      id: 'comments',
      title: 'Comments & Mentions',
      description: 'Comments on your posts and when you\'re mentioned',
      enabled: true,
      icon: MessageSquare,
      category: 'social'
    },
    {
      id: 'photo_tags',
      title: 'Photo Tags',
      description: 'When you\'re tagged in photos',
      enabled: false,
      icon: Camera,
      category: 'social'
    },
    // Travel Notifications
    {
      id: 'travel_updates',
      title: 'Travel Updates',
      description: 'Updates from friends about their travels',
      enabled: true,
      icon: MapPin,
      category: 'travel'
    },
    {
      id: 'achievements',
      title: 'Achievements',
      description: 'When you unlock new travel badges',
      enabled: true,
      icon: Award,
      category: 'travel'
    },
    {
      id: 'trip_reminders',
      title: 'Trip Reminders',
      description: 'Reminders about upcoming trips',
      enabled: true,
      icon: BellRing,
      category: 'travel'
    }
  ]);

  const [privacySettings, setPrivacySettings] = useState([
    {
      id: 'profile_visibility',
      title: 'Profile Visibility',
      description: 'Who can see your profile',
      enabled: true,
      icon: Eye
    },
    {
      id: 'trip_visibility',
      title: 'Trip Visibility',
      description: 'Who can see your trips',
      enabled: true,
      icon: Globe
    },
    {
      id: 'location_sharing',
      title: 'Location Sharing',
      description: 'Share your current location with friends',
      enabled: false,
      icon: MapPin
    },
    {
      id: 'activity_status',
      title: 'Activity Status',
      description: 'Show when you\'re online',
      enabled: true,
      icon: Users
    }
  ]);

  const toggleSetting = (settingId: string) => {
    setSettings(prev => 
      prev.map(setting => 
        setting.id === settingId 
          ? { ...setting, enabled: !setting.enabled }
          : setting
      )
    );
    
    toast({
      title: "Setting updated",
      description: "Your notification preference has been saved",
    });
  };

  const togglePrivacySetting = (settingId: string) => {
    setPrivacySettings(prev => 
      prev.map(setting => 
        setting.id === settingId 
          ? { ...setting, enabled: !setting.enabled }
          : setting
      )
    );
    
    toast({
      title: "Privacy setting updated",
      description: "Your privacy preference has been saved",
    });
  };

  const enableAllNotifications = () => {
    setSettings(prev => prev.map(setting => ({ ...setting, enabled: true })));
    toast({
      title: "All notifications enabled",
      description: "You'll receive all travel and social updates",
    });
  };

  const disableAllNotifications = () => {
    setSettings(prev => prev.map(setting => ({ ...setting, enabled: false })));
    toast({
      title: "All notifications disabled",
      description: "You won't receive any notifications",
    });
  };

  const socialSettings = settings.filter(s => s.category === 'social');
  const travelSettings = settings.filter(s => s.category === 'travel');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Bell size={24} className="text-blue-600" />
              <span>Notification Settings</span>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm" onClick={enableAllNotifications}>
                Enable all
              </Button>
              <Button variant="ghost" size="sm" onClick={disableAllNotifications}>
                Disable all
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 pb-6">
            {/* Social Notifications */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Users size={20} className="text-blue-600" />
                <h3 className="font-semibold text-gray-900">Social Notifications</h3>
                <Badge variant="secondary" className="text-xs">
                  {socialSettings.filter(s => s.enabled).length}/{socialSettings.length}
                </Badge>
              </div>
              <div className="space-y-3">
                {socialSettings.map((setting) => {
                  const Icon = setting.icon;
                  return (
                    <div key={setting.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                      <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mt-1">
                        <Icon size={16} className="text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {setting.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {setting.description}
                            </p>
                          </div>
                          <Switch
                            checked={setting.enabled}
                            onCheckedChange={() => toggleSetting(setting.id)}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Travel Notifications */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <MapPin size={20} className="text-green-600" />
                <h3 className="font-semibold text-gray-900">Travel Notifications</h3>
                <Badge variant="secondary" className="text-xs">
                  {travelSettings.filter(s => s.enabled).length}/{travelSettings.length}
                </Badge>
              </div>
              <div className="space-y-3">
                {travelSettings.map((setting) => {
                  const Icon = setting.icon;
                  return (
                    <div key={setting.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                      <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center mt-1">
                        <Icon size={16} className="text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {setting.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {setting.description}
                            </p>
                          </div>
                          <Switch
                            checked={setting.enabled}
                            onCheckedChange={() => toggleSetting(setting.id)}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Privacy Settings */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Shield size={20} className="text-purple-600" />
                <h3 className="font-semibold text-gray-900">Privacy Settings</h3>
                <Badge variant="secondary" className="text-xs">
                  {privacySettings.filter(s => s.enabled).length}/{privacySettings.length}
                </Badge>
              </div>
              <div className="space-y-3">
                {privacySettings.map((setting) => {
                  const Icon = setting.icon;
                  return (
                    <div key={setting.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50">
                      <div className="w-10 h-10 bg-purple-50 rounded-full flex items-center justify-center mt-1">
                        <Icon size={16} className="text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {setting.title}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {setting.description}
                            </p>
                          </div>
                          <Switch
                            checked={setting.enabled}
                            onCheckedChange={() => togglePrivacySetting(setting.id)}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationsModal;
