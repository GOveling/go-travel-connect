
import { Home, Compass, MapPin, Calendar, User } from "lucide-react";

interface BottomNavigationProps {
  activeSection: string;
  setActiveSection: (tab: string) => void;
}

const BottomNavigation = ({ activeSection, setActiveSection }: BottomNavigationProps) => {
  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "explore", icon: Compass, label: "Explore" },
    { id: "trips", icon: MapPin, label: "My Trips" },
    { id: "booking", icon: Calendar, label: "Booking" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 px-4 py-2 z-50">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
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
