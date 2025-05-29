
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
    <div className="pb-4">
      <div className="flex justify-between items-center mb-4">
        {/* Logo on the left */}
        <div className="flex-1 flex justify-start">
          <img 
            src="/lovable-uploads/ab817c30-2b47-4b5b-9678-711900c7df72.png" 
            alt="GOveling Logo" 
            className="h-32 w-auto"
          />
        </div>
        
        {/* InstanTrip button in the center */}
        <div className="flex-1 flex justify-center">
          <div className="relative">
            <Button
              onClick={onInstaTripClick}
              className="bg-gradient-to-r from-purple-600 to-orange-500 hover:from-purple-700 hover:to-orange-600 text-white px-6 py-2 rounded-full shadow-lg"
            >
              <Plus size={20} className="mr-2" />
              InstanTrip
            </Button>
            {instaTripImageCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-[20px]"
              >
                {instaTripImageCount > 9 ? '9+' : instaTripImageCount}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Notification bell on the right */}
        <div className="flex-1 flex justify-end">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={onNotificationClick}
              className="relative p-2 hover:bg-gray-100 rounded-full"
            >
              <Bell size={24} className="text-gray-600" />
              {notificationCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-[20px]"
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>
      <p className="mt-2 text-center">
        <span className="text-purple-600 font-semibold">Travel Smart</span>
        <span className="text-gray-600">, </span>
        <span className="text-orange-500 font-semibold">Travel More</span>
      </p>
    </div>
  );
};

export default HomeHeader;
