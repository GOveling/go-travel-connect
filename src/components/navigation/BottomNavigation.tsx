
import { Home, Compass, MapPin, Calendar, User } from "lucide-react";

interface BottomNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const BottomNavigation = ({ activeTab, setActiveTab }: BottomNavigationProps) => {
  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "explore", icon: Compass, label: "Explore" },
    { id: "trips", icon: MapPin, label: "My Trips" },
    { id: "booking", icon: Calendar, label: "Booking" },
    { id: "profile", icon: User, label: "Profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-in-right">
      {/* Glass morphism background */}
      <div className="glass backdrop-blur-xl bg-white/90 border-t border-white/20 px-4 py-3 shadow-modern-lg">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center p-3 rounded-2xl transition-all duration-300 relative interactive ${
                  isActive
                    ? "bg-gradient-to-r from-purple-600 to-orange-500 text-white scale-105 shadow-modern"
                    : "text-gray-600 hover:text-purple-600 hover:bg-white/50"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Active indicator background */}
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-orange-500/20 rounded-2xl blur-lg animate-pulse-glow"></div>
                )}
                
                <div className="relative z-10 flex flex-col items-center">
                  <Icon 
                    size={22} 
                    className={`mb-1 transition-all duration-300 ${
                      isActive ? "drop-shadow-sm" : ""
                    }`} 
                  />
                  <span className={`text-xs font-medium transition-all duration-300 ${
                    isActive ? "font-semibold" : ""
                  }`}>
                    {item.label}
                  </span>
                </div>

                {/* Ripple effect */}
                {isActive && (
                  <div className="absolute inset-0 rounded-2xl bg-white/20 animate-ping opacity-75"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Floating indicator */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-gradient-to-r from-purple-600 to-orange-500 rounded-full opacity-30"></div>
      </div>

      {/* SVG Background Pattern */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute bottom-0 left-0 w-full h-20" viewBox="0 0 400 80" preserveAspectRatio="none">
          <defs>
            <linearGradient id="navGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.1" />
              <stop offset="50%" stopColor="#F97316" stopOpacity="0.05" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          <path d="M0,80 Q100,60 200,70 T400,65 L400,80 Z" fill="url(#navGradient)" />
        </svg>
      </div>
    </div>
  );
};

export default BottomNavigation;
