import { Bell } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const NotificationEmptyState = () => {
  const { t } = useLanguage();

  return (
    <div className="text-center py-8">
      <Bell size={48} className="text-gray-300 mx-auto mb-4" />
      <p className="text-gray-500">{t("notifications.noNotifications")}</p>
    </div>
  );
};

export default NotificationEmptyState;
