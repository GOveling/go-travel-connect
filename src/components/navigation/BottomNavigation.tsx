import { Home, Compass, MapPin, Calendar, User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  InteractiveMenu,
  InteractiveMenuItem,
} from "@/components/ui/modern-mobile-menu";

interface BottomNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const BottomNavigation = ({
  activeTab,
  setActiveTab,
}: BottomNavigationProps) => {
  const { t } = useLanguage();

  const navItems = [
    { id: "home", icon: Home, label: t("navigation.home") },
    { id: "explore", icon: Compass, label: t("navigation.explore") },
    { id: "trips", icon: MapPin, label: t("navigation.trips") },
    { id: "booking", icon: Calendar, label: t("navigation.booking") },
    { id: "profile", icon: User, label: t("navigation.profile") },
  ];

  const menuItems: InteractiveMenuItem[] = navItems.map((item) => ({
    label: item.label,
    icon: item.icon,
  }));

  const activeIndex = navItems.findIndex((item) => item.id === activeTab);

  const handleItemClick = (index: number) => {
    setActiveTab(navItems[index].id);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 px-4 py-2 z-50">
      <div className="max-w-md mx-auto">
        <InteractiveMenu
          items={menuItems}
          activeIndex={activeIndex}
          onItemClick={handleItemClick}
          accentColor="hsl(var(--primary))"
        />
      </div>
    </div>
  );
};

export default BottomNavigation;
