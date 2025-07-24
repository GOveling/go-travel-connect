import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Language } from "@/contexts/LanguageTypes";
import { useLanguage } from "@/hooks/useLanguage";
import {
  Bell,
  HelpCircle,
  Languages,
  Moon,
  Settings,
  Shield,
  Sun,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal = ({ isOpen, onClose }: SettingsModalProps) => {
  const { language, setLanguage, t, supportedLanguages } = useLanguage();

  const [darkMode, setDarkMode] = useState(() => {
    // Check if dark mode is already enabled
    return document.documentElement.classList.contains("dark");
  });
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [locationSharing, setLocationSharing] = useState(false);
  const [profileVisibility, setProfileVisibility] = useState("public");

  // Handle dark mode toggle
  const handleDarkModeToggle = (enabled: boolean) => {
    setDarkMode(enabled);
    if (enabled) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("darkMode", "true");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("darkMode", "false");
    }
  };

  // Handle language change - now integrated with context
  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage as Language);
  };

  // Load preferences on component mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode");
    if (savedDarkMode === "true") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    } else if (savedDarkMode === "false") {
      setDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const settingSections = [
    {
      title: t("settings.account"),
      icon: User,
      items: [
        {
          label: t("settings.profileVisibility.label"),
          description: t("settings.profileVisibility.description"),
          type: "select",
          value: profileVisibility,
          onChange: setProfileVisibility,
          options: [
            { value: "public", label: t("settings.profileVisibility.public") },
            {
              value: "friends",
              label: t("settings.profileVisibility.friends"),
            },
            {
              value: "private",
              label: t("settings.profileVisibility.private"),
            },
          ],
        },
      ],
    },
    {
      title: t("settings.language"),
      icon: Languages,
      items: [
        {
          label: t("settings.appLanguage.label"),
          description: t("settings.appLanguage.description"),
          type: "select",
          value: language,
          onChange: handleLanguageChange,
          options: supportedLanguages.map((lang) => ({
            value: lang.code,
            label: lang.nativeName,
          })),
        },
      ],
    },
    {
      title: t("settings.notifications"),
      icon: Bell,
      items: [
        {
          label: t("settings.pushNotifications.label"),
          description: t("settings.pushNotifications.description"),
          type: "switch",
          value: pushNotifications,
          onChange: setPushNotifications,
        },
        {
          label: t("settings.emailNotifications.label"),
          description: t("settings.emailNotifications.description"),
          type: "switch",
          value: emailNotifications,
          onChange: setEmailNotifications,
        },
      ],
    },
    {
      title: t("settings.privacy"),
      icon: Shield,
      items: [
        {
          label: t("settings.locationSharing.label"),
          description: t("settings.locationSharing.description"),
          type: "switch",
          value: locationSharing,
          onChange: setLocationSharing,
        },
      ],
    },
    {
      title: t("settings.appearance"),
      icon: darkMode ? Moon : Sun,
      items: [
        {
          label: t("settings.darkMode.label"),
          description: t("settings.darkMode.description"),
          type: "switch",
          value: darkMode,
          onChange: handleDarkModeToggle,
        },
      ],
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="text-purple-600" size={24} />
            <span>{t("settings.title")}</span>
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
                    <div
                      key={index}
                      className="flex items-center justify-between space-x-3"
                    >
                      <div className="flex-1 min-w-0">
                        <Label className="text-sm font-medium">
                          {item.label}
                        </Label>
                        <p className="text-xs text-gray-500">
                          {item.description}
                        </p>
                      </div>
                      <div className="shrink-0">
                        {item.type === "switch" ? (
                          <Switch
                            checked={item.value as boolean}
                            onCheckedChange={item.onChange}
                          />
                        ) : item.type === "select" ? (
                          <Select
                            value={item.value as string}
                            onValueChange={item.onChange}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {item.options?.map((option) => (
                                <SelectItem
                                  key={option.value}
                                  value={option.value}
                                >
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
                <span>{t("settings.support")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant="ghost"
                className="w-full justify-start p-0 h-auto"
              >
                <div className="text-left">
                  <p className="text-sm font-medium">
                    {t("settings.helpCenter.title")}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t("settings.helpCenter.description")}
                  </p>
                </div>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start p-0 h-auto"
              >
                <div className="text-left">
                  <p className="text-sm font-medium">
                    {t("settings.privacyPolicy.title")}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t("settings.privacyPolicy.description")}
                  </p>
                </div>
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start p-0 h-auto"
              >
                <div className="text-left">
                  <p className="text-sm font-medium">
                    {t("settings.termsOfService.title")}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t("settings.termsOfService.description")}
                  </p>
                </div>
              </Button>
            </CardContent>
          </Card>

          {/* App Version */}
          <div className="text-center text-xs text-gray-500 pt-2">
            {t("settings.appVersion")}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsModal;
