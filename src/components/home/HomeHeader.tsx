import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/hooks/useLanguage";
import { useInvitationNotifications } from "@/hooks/useInvitationNotifications";
interface HomeHeaderProps {
  notificationCount: number;
  onNotificationClick: () => void;
}
const HomeHeader = ({
  notificationCount,
  onNotificationClick,
}: HomeHeaderProps) => {
  const { t } = useLanguage();
  const { totalCount: invitationCount } = useInvitationNotifications();
  
  const totalNotifications = notificationCount + invitationCount;
  return (
    <div className="pb-4">
      <div className="flex justify-between items-center mb-2 mx-0 px-0">
        {/* Logo on the left */}
        <div className="flex-1 flex justify-start px-0 mx-[5px]">
          <img
            alt="GOveling Logo"
            className="h-32 w-auto object-contain"
            src="/lovable-uploads/c492703b-bdd8-4cd6-9360-0748aea28be9.png"
          />
        </div>

        {/* Notification bell on the right */}
        <div className="flex-1 flex justify-end mx-[37px]">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={onNotificationClick}
              className="relative p-2 hover:bg-gray-100 rounded-full"
            >
              <Bell size={24} className="text-gray-600" />
              {totalNotifications > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 min-w-[20px]"
                >
                  {totalNotifications > 9 ? "9+" : totalNotifications}
                </Badge>
              )}
            </Button>
          </div>
        </div>
      </div>
      <p className="mt-1 text-center">
        <span className="text-purple-600 font-semibold">
          {t("home.travelSmart")}
        </span>
        <span className="text-gray-600">, </span>
        <span className="text-orange-500 font-semibold">
          {t("home.travelMore")}
        </span>
      </p>
    </div>
  );
};
export default HomeHeader;
