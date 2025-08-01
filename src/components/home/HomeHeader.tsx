import { useLanguage } from "@/hooks/useLanguage";
import InvitationNotificationBell from "../navigation/InvitationNotificationBell";

interface HomeHeaderProps {
  notificationCount: number;
  onNotificationClick: () => void;
}

const HomeHeader = ({
  notificationCount,
  onNotificationClick,
}: HomeHeaderProps) => {
  const { t } = useLanguage();
  
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
          <InvitationNotificationBell />
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