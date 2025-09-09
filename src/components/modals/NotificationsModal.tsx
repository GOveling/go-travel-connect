import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Bell,
  BellRing,
  Shield,
  MapPin,
  Camera,
  Award,
  Settings,
  Check,
  X,
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
  category: "travel" | "privacy";
  color: string;
}

const NotificationsModal = ({ isOpen, onClose }: NotificationsModalProps) => {
  const { toast } = useToast();

  const [settings, setSettings] = useState<NotificationSetting[]>([
    // Travel Notifications - All enabled by default
    {
      id: "travel_updates",
      title: "Travel Updates",
      description: "Updates from friends about their travels",
      enabled: true,
      icon: MapPin,
      category: "travel",
      color: "text-orange-600",
    },
    {
      id: "achievements",
      title: "Travel Achievements",
      description: "When you unlock new travel badges and milestones",
      enabled: true,
      icon: Award,
      category: "travel",
      color: "text-yellow-600",
    },
    {
      id: "trip_reminders",
      title: "Trip Reminders",
      description: "Reminders about upcoming trips and bookings",
      enabled: true,
      icon: BellRing,
      category: "travel",
      color: "text-indigo-600",
    },
    {
      id: "instant_trip",
      title: "InstaTrip Notifications",
      description: "Updates about your instant trip captures",
      enabled: true,
      icon: Camera,
      category: "travel",
      color: "text-pink-600",
    },
  ]);

  const [privacySettings, setPrivacySettings] = useState([
    {
      id: "profile_visibility",
      title: "Profile Visibility",
      description: "Control who can see your travel profile",
      enabled: true,
      icon: Shield,
      color: "text-purple-600",
    },
    {
      id: "trip_visibility",
      title: "Trip Sharing",
      description: "Manage who can see your trip details",
      enabled: true,
      icon: MapPin,
      color: "text-blue-600",
    },
    {
      id: "location_sharing",
      title: "Real-time Location",
      description: "Share your current location with friends",
      enabled: true,
      icon: MapPin,
      color: "text-red-600",
    },
  ]);

  const toggleSetting = (settingId: string) => {
    setSettings((prev) =>
      prev.map((setting) =>
        setting.id === settingId
          ? { ...setting, enabled: !setting.enabled }
          : setting
      )
    );

    toast({
      title: "Notification updated",
      description: "Your preference has been saved successfully",
    });
  };

  const togglePrivacySetting = (settingId: string) => {
    setPrivacySettings((prev) =>
      prev.map((setting) =>
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
    setSettings((prev) =>
      prev.map((setting) => ({ ...setting, enabled: true }))
    );
    toast({
      title: "All notifications enabled",
      description: "You'll receive all travel updates",
    });
  };

  const disableAllNotifications = () => {
    setSettings((prev) =>
      prev.map((setting) => ({ ...setting, enabled: false }))
    );
    toast({
      title: "All notifications disabled",
      description: "You won't receive any notifications",
    });
  };

  const resetToDefaults = () => {
    setSettings((prev) =>
      prev.map((setting) => ({ ...setting, enabled: true }))
    );
    setPrivacySettings((prev) =>
      prev.map((setting) => ({ ...setting, enabled: true }))
    );
    toast({
      title: "Settings reset",
      description: "All notification preferences enabled by default",
    });
  };

  const travelSettings = settings.filter((s) => s.category === "travel");
  const enabledCount = settings.filter((s) => s.enabled).length;
  const totalCount = settings.length;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-lg mx-auto h-[90vh] flex flex-col p-0 overflow-hidden rounded-3xl shadow-2xl animate-scale-in border-0 bg-white/95 backdrop-blur-sm">
        <DialogHeader className="p-6 pb-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b flex-shrink-0">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Bell size={20} className="text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Notifications
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  {enabledCount} of {totalCount} enabled
                </p>
              </div>
            </div>
            <Badge
              variant="secondary"
              className="bg-blue-100 text-blue-700 border-blue-200"
            >
              Settings
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {/* Quick Actions */}
        <div className="px-6 py-4 bg-gray-50 border-b flex-shrink-0">
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={enableAllNotifications}
              className="text-xs flex items-center space-x-1"
            >
              <Check size={14} />
              <span>Enable All</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={disableAllNotifications}
              className="text-xs flex items-center space-x-1"
            >
              <X size={14} />
              <span>Disable All</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetToDefaults}
              className="text-xs flex items-center space-x-1"
            >
              <Settings size={14} />
              <span>Reset</span>
            </Button>
          </div>
        </div>

        <ScrollArea className="flex-1 px-6">
          <div className="space-y-6 py-6">
            {/* Travel Notifications */}
            <Card className="border-0 shadow-sm bg-green-50/30">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <MapPin size={16} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      Travel Notifications
                    </h3>
                    <p className="text-xs text-gray-600">
                      Stay updated on your journeys
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {travelSettings.filter((s) => s.enabled).length}/
                    {travelSettings.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {travelSettings.map((setting) => {
                    const Icon = setting.icon;
                    return (
                      <div
                        key={setting.id}
                        className="flex items-center space-x-3 p-3 rounded-lg bg-white/60 hover:bg-white transition-colors"
                      >
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <Icon size={16} className={setting.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {setting.title}
                              </p>
                              <p className="text-xs text-gray-600 mt-0.5">
                                {setting.description}
                              </p>
                            </div>
                            <Switch
                              checked={setting.enabled}
                              onCheckedChange={() => toggleSetting(setting.id)}
                              className="ml-3"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Privacy Settings */}
            <Card className="border-0 shadow-sm bg-purple-50/30">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Shield size={16} className="text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-sm">
                      Privacy & Visibility
                    </h3>
                    <p className="text-xs text-gray-600">
                      Control your data sharing
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {privacySettings.filter((s) => s.enabled).length}/
                    {privacySettings.length}
                  </Badge>
                </div>
                <div className="space-y-3">
                  {privacySettings.map((setting) => {
                    const Icon = setting.icon;
                    return (
                      <div
                        key={setting.id}
                        className="flex items-center space-x-3 p-3 rounded-lg bg-white/60 hover:bg-white transition-colors"
                      >
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                          <Icon size={16} className={setting.color} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {setting.title}
                              </p>
                              <p className="text-xs text-gray-600 mt-0.5">
                                {setting.description}
                              </p>
                            </div>
                            <Switch
                              checked={setting.enabled}
                              onCheckedChange={() =>
                                togglePrivacySetting(setting.id)
                              }
                              className="ml-3"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t bg-gray-50 flex-shrink-0">
          <p className="text-xs text-gray-500 text-center">
            Changes are saved automatically • Configure notifications to enhance
            your travel experience
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NotificationsModal;
