import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";

interface NotificationHeaderProps {
  unreadCount: number;
  onMarkAllRead: () => void;
}

const NotificationHeader = ({
  unreadCount,
  onMarkAllRead,
}: NotificationHeaderProps) => {
  const { t } = useLanguage();

  return (
    <DialogHeader className="p-4 sm:p-6 pb-4 flex-shrink-0 border-b">
      <DialogTitle className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell size={24} className="text-blue-600" />
          <span className="text-base sm:text-lg">
            {t("notifications.title")}
          </span>
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="h-5 w-5 flex items-center justify-center text-xs p-0"
            >
              {unreadCount}
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onMarkAllRead}
          disabled={unreadCount === 0}
          className="text-xs sm:text-sm"
        >
          {t("notifications.markAllRead")}
        </Button>
      </DialogTitle>
    </DialogHeader>
  );
};

export default NotificationHeader;
