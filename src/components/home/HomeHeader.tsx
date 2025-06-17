
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

interface HomeHeaderProps {
  notificationCount: number;
  onNotificationClick: () => void;
}

const HomeHeader = ({ 
  notificationCount, 
  onNotificationClick 
}: HomeHeaderProps) => {
  const { t } = useLanguage();
  
  return (
    <div className="pb-4">
      <div className="flex justify-between items-center mb-2">
        {/* Logo on the left */}
        <div className="flex-1 flex justify-start">
          <img 
            src="/lovable-uploads/ab817c30-2b47-4b5b-9678-711900c7df72.png" 
            alt="GOveling Logo" 
            className="h-32 w-auto"
          />
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
      <p className="mt-1 text-center">
        <span className="text-purple-600 font-semibold">{t("home.travelSmart")}</span>
        <span className="text-gray-600">, </span>
        <span className="text-orange-500 font-semibold">{t("home.travelMore")}</span>
      </p>
    </div>
  );
};

export default HomeHeader;
