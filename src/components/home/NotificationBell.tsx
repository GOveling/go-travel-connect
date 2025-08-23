
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/hooks/useLanguage";

interface NotificationBellProps {
  onNotificationClick: () => void;
}

const NotificationBell = ({ onNotificationClick }: NotificationBellProps) => {
  const { t } = useLanguage();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg">{t("home.notifications.title")}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onNotificationClick}>
          <Bell size={16} />
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-center py-4">
          <Bell size={32} className="mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500 text-sm">{t("home.notifications.noNotifications")}</p>
          <Button variant="outline" size="sm" className="mt-2">
            {t("home.notifications.markAllAsRead")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationBell;
