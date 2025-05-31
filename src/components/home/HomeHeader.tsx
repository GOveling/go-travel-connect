
import { Bell, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface HomeHeaderProps {
  notificationCount: number;
  instaTripImageCount: number;
  onNotificationClick: () => void;
  onInstaTripClick: () => void;
}

const HomeHeader = ({ 
  notificationCount, 
  instaTripImageCount, 
  onNotificationClick, 
  onInstaTripClick 
}: HomeHeaderProps) => {
  return (
    <div className="pb-6 px-4 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        {/* Logo on the left */}
        <div className="flex-1 flex justify-start">
          <div className="relative">
            <img 
              src="/lovable-uploads/ab817c30-2b47-4b5b-9678-711900c7df72.png" 
              alt="GOveling Logo" 
              className="h-28 w-auto animate-float drop-shadow-lg"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-orange-500/20 rounded-lg blur-xl animate-pulse-glow"></div>
          </div>
        </div>
        
        {/* InstanTrip button in the center */}
        <div className="flex-1 flex justify-center">
          <div className="relative group">
            <Button
              onClick={onInstaTripClick}
              className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white px-8 py-3 rounded-2xl shadow-modern hover:shadow-modern-lg transition-all duration-300 btn-modern interactive"
            >
              <Plus size={20} className="mr-2 transition-transform group-hover:rotate-90 duration-300" />
              <span className="font-semibold">InstanTrip</span>
            </Button>
            {instaTripImageCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-2 -right-2 h-6 w-6 flex items-center justify-center text-xs p-0 min-w-[24px] animate-bounce-in bg-red-500 text-white shadow-lg"
              >
                {instaTripImageCount > 9 ? '9+' : instaTripImageCount}
              </Badge>
            )}
            {/* Floating particles effect */}
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/20 to-orange-500/20 rounded-3xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          </div>
        </div>
        
        {/* Notification bell on the right */}
        <div className="flex-1 flex justify-end">
          <div className="relative group">
            <Button
              variant="ghost"
              size="sm"
              onClick={onNotificationClick}
              className="relative p-3 hover:bg-gray-100 rounded-2xl transition-all duration-300 interactive"
            >
              <Bell size={24} className="text-gray-600 group-hover:text-purple-600 transition-colors duration-300" />
              {notificationCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-[20px] animate-bounce-in bg-red-500 text-white"
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Enhanced tagline */}
      <div className="relative overflow-hidden">
        <div className="glass rounded-2xl px-6 py-4 mx-2 shadow-modern">
          <p className="text-center relative z-10">
            <span className="text-purple-600 font-bold text-lg tracking-wide drop-shadow-sm animate-fade-in-up">
              Travel Smart
            </span>
            <span className="text-gray-400 mx-3 text-xl">•</span>
            <span className="text-orange-500 font-bold text-lg tracking-wide drop-shadow-sm animate-fade-in-up">
              Travel More
            </span>
          </p>
          {/* Animated background gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-transparent to-orange-500/10 animate-shimmer opacity-50"></div>
        </div>
      </div>

      {/* SVG Decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full animate-float">
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="100%" stopColor="#F97316" />
            </linearGradient>
          </defs>
          <circle cx="20" cy="20" r="3" fill="url(#gradient1)">
            <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="50" cy="30" r="4" fill="url(#gradient1)">
            <animate attributeName="opacity" values="1;0.3;1" dur="2.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="80" cy="40" r="2" fill="url(#gradient1)">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="3s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>
    </div>
  );
};

export default HomeHeader;
