import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

interface NotificationBellProps {
  notificationCount: number;
  onNotificationClick: () => void;
}

const NotificationBell = ({
  notificationCount,
  onNotificationClick,
}: NotificationBellProps) => {
  return (
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
            {notificationCount > 9 ? "9+" : notificationCount}
          </Badge>
        )}
      </Button>
    </div>
  );
};

export default NotificationBell;
