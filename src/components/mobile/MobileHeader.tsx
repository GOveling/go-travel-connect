import { ArrowLeft, Menu, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileHeaderProps {
  title: string;
  showBack?: boolean;
  showMenu?: boolean;
  showNotifications?: boolean;
  onBackClick?: () => void;
  onMenuClick?: () => void;
  onNotificationClick?: () => void;
  notificationCount?: number;
}

const MobileHeader = ({
  title,
  showBack = false,
  showMenu = false,
  showNotifications = false,
  onBackClick,
  onMenuClick,
  onNotificationClick,
  notificationCount = 0,
}: MobileHeaderProps) => {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-orange-500 text-white px-4 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        {showBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackClick}
            className="text-white hover:bg-white/20 p-2"
          >
            <ArrowLeft size={20} />
          </Button>
        )}
        {showMenu && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuClick}
            className="text-white hover:bg-white/20 p-2"
          >
            <Menu size={20} />
          </Button>
        )}
        <h1 className="text-lg font-semibold truncate">{title}</h1>
      </div>

      {showNotifications && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onNotificationClick}
          className="text-white hover:bg-white/20 p-2 relative"
        >
          <Bell size={20} />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </Button>
      )}
    </div>
  );
};

export default MobileHeader;
