
import { Home, Compass, MapPin, Calendar, User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface BottomNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const BottomNavigation = ({ activeTab, setActiveTab }: BottomNavigationProps) => {
  const { t } = useLanguage();
  
  const navItems = [
    { id: "home", icon: Home, label: t("navigation.home") },
    { id: "explore", icon: Compass, label: t("navigation.explore") },
    { id: "trips", icon: MapPin, label: t("navigation.trips") },
    { id: "booking", icon: Calendar, label: t("navigation.booking") },
    { id: "profile", icon: User, label: t("navigation.profile") },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center p-2 rounded-xl transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-purple-600 to-orange-500 text-white scale-105"
                  : "text-gray-600 hover:text-purple-600 hover:bg-purple-50"
              }`}
            >
              <Icon size={22} className="mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
