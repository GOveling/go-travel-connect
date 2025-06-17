import { useState, useEffect } from "react";
import { Settings, User, Bell, Shield, Globe, Moon, Sun, Smartphone, HelpCircle, Languages } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const [darkMode, setDarkMode] = useState(() => {
    // Check if dark mode is already enabled
    return document.documentElement.classList.contains('dark');
  });
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState("public");
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem('appLanguage') || 'en';
  });

  // Handle dark mode toggle
  const handleDarkModeToggle = (enabled: boolean) => {
    setDarkMode(enabled);
    if (enabled) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
    }
  };

  // Handle language change
  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
    localStorage.setItem('appLanguage', language);
    // Here you would typically trigger a global language change
    // For now, we'll just store it in localStorage
  };

  // Load preferences on component mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'true') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else if (savedDarkMode === 'false') {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const settingSections = [
    {
      title: "Account",
      icon: User,
      items: [
        {
          label: "Profile Visibility",
          description: "Who can see your profile",
          type: "select",
          value: profileVisibility,
          onChange: setProfileVisibility,
          options: [
            { value: "public", label: "Public" },
            { value: "friends", label: "Friends Only" },
            { value: "private", label: "Private" }
          ]
        }
      ]
    },
    {
      title: "Language / Idioma",
      icon: Languages,
      items: [
        {
          label: "App Language",
          description: "Choose your preferred language",
          type: "select",
          value: selectedLanguage,
          onChange: handleLanguageChange,
          options: [
            { value: "en", label: "English" },
            { value: "es", label: "Español" },
            { value: "pt", label: "Português" },
            { value: "fr", label: "Français" },
            { value: "it", label: "Italiano" },
            { value: "zh", label: "中文" }
          ]
        }
      ]
    },
    {
      title: "Notifications",
      icon: Bell,
      items: [
        {
          label: "Push Notifications",
          description: "Receive notifications on your device",
          type: "switch",
          value: pushNotifications,
          onChange: setPushNotifications
        },
        {
          label: "Email Notifications",
          description: "Receive updates via email",
          type: "switch",
          value: emailNotifications,
          onChange: setEmailNotifications
        }
      ]
    },
    {
      title: "Privacy",
      icon: Shield,
      items: [
        {
          label: "Location Sharing",
          description: "Share your location with friends",
          type: "switch",
          value: locationSharing,
          onChange: setLocationSharing
        }
      ]
    },
    {
      title: "Appearance",
      icon: darkMode ? Moon : Sun,
      items: [
        {
          label: "Dark Mode",
          description: "Use dark theme",
          type: "switch",
          value: darkMode,
          onChange: handleDarkModeToggle
        }
      ]
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="text-purple-600" size={24} />
            <span>Settings</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {settingSections.map((section) => {
            const SectionIcon = section.icon;
            return (
              <Card key={section.title}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-base">
                    <SectionIcon size={18} className="text-gray-600" />
                    <span>{section.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {section.items.map((item, index) => (
                    <div key={index} className="flex items-center justify-between space-x-3">
                      <div className="flex-1 min-w-0">
                        <Label className="text-sm font-medium">{item.label}</Label>
                        <p className="text-xs text-gray-500">{item.description}</p>
                      </div>
                      <div className="shrink-0">
                        {item.type === "switch" ? (
                          <Switch
                            checked={item.value as boolean}
                            onCheckedChange={item.onChange}
                          />
                        ) : item.type === "select" ? (
                          <Select value={item.value as string} onValueChange={item.onChange}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {item.options?.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            );
          })}

          {/* Additional Options */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center space-x-2 text-base">
                <HelpCircle size={18} className="text-gray-600" />
                <span>Support</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="ghost" className="w-full justify-start p-0 h-auto">
                <div className="text-left">
                  <p className="text-sm font-medium">Help Center</p>
                  <p className="text-xs text-gray-500">Get help and support</p>
                </div>
              </Button>
              <Button variant="ghost" className="w-full justify-start p-0 h-auto">
                <div className="text-left">
                  <p className="text-sm font-medium">Privacy Policy</p>
                  <p className="text-xs text-gray-500">Read our privacy policy</p>
                </div>
              </Button>
              <Button variant="ghost" className="w-full justify-start p-0 h-auto">
                <div className="text-left">
                  <p className="text-sm font-medium">Terms of Service</p>
                  <p className="text-xs text-gray-500">View terms and conditions</p>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* App Version */}
          <div className="text-center text-xs text-gray-500 pt-2">
            Travel App v1.0.0
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
