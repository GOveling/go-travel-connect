
import React from "react";
import { Button } from "@/components/ui/button";
import { Bell, Camera } from "lucide-react";

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
  onInstaTripClick,
}: HomeHeaderProps) => {
  return (
    <div className="flex items-center justify-between p-1">
      {/* Logo on the left */}
      <div className="flex items-center">
        <img 
          src="/lovable-uploads/2e7d8d8c-8611-4e84-84a8-467fc6bcbdc7.png" 
          alt="GoVeling Logo" 
          className="h-32 w-auto"
        />
      </div>

      {/* InstanTrip Button in the center */}
      <div className="flex-1 flex justify-center">
        <Button
          onClick={onInstaTripClick}
          variant="outline"
          size="icon"
          className="relative bg-white border-orange-200 hover:bg-orange-50"
        >
          <Camera className="h-4 w-4 text-orange-600" />
          {instaTripImageCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {instaTripImageCount}
            </span>
          )}
        </Button>
      </div>

      {/* Notification Bell on the right */}
      <div className="flex items-center">
        <Button
          onClick={onNotificationClick}
          variant="outline"
          size="icon"
          className="relative bg-white border-purple-200 hover:bg-purple-50"
        >
          <Bell className="h-4 w-4 text-purple-600" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {notificationCount}
            </span>
          )}
        </Button>
      </div>
    </div>
  );
};

export default HomeHeader;
