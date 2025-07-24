import { Home, MapPin, Search, Calendar, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MobileNavigation = ({
  activeTab,
  onTabChange,
}: MobileNavigationProps) => {
  const tabs = [
    { id: "home", label: "Inicio", icon: Home },
    { id: "explore", label: "Explorar", icon: Search },
    { id: "trips", label: "Viajes", icon: MapPin },
    { id: "booking", label: "Reservas", icon: Calendar },
    { id: "travelers", label: "Viajeros", icon: Users },
    { id: "profile", label: "Perfil", icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 safe-area-bottom">
      <div className="flex justify-around items-center">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={cn(
              "flex flex-col items-center py-2 px-3 rounded-lg transition-all duration-200 min-w-0 flex-1",
              activeTab === id
                ? "text-purple-600 bg-purple-50"
                : "text-gray-600 hover:text-purple-600 hover:bg-gray-50"
            )}
          >
            <Icon size={20} className="mb-1" />
            <span className="text-xs font-medium truncate w-full text-center">
              {label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default MobileNavigation;
