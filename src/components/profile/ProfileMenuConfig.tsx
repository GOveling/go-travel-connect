
import { FileText, Bell, Settings, Award, Share } from "lucide-react";
import { MenuItemConfig } from "@/types/profile";
import { TravelStats } from "@/types/profile";

interface ProfileMenuConfigProps {
  stats: TravelStats;
  modalState: {
    setIsTravelDocumentsModalOpen: (open: boolean) => void;
    setIsNotificationsModalOpen: (open: boolean) => void;
    setIsTravelAchievementsModalOpen: (open: boolean) => void;
    setIsShareProfileModalOpen: (open: boolean) => void;
    setIsSettingsModalOpen: (open: boolean) => void;
  };
}

export const useProfileMenuConfig = ({ stats, modalState }: ProfileMenuConfigProps): MenuItemConfig[] => {
  return [
    { 
      icon: FileText, 
      title: "Travel Documents", 
      subtitle: "Passports, visas, tickets", 
      color: "text-blue-600",
      onClick: () => modalState.setIsTravelDocumentsModalOpen(true)
    },
    { 
      icon: Bell, 
      title: "Notifications", 
      subtitle: "Manage alerts & updates", 
      color: "text-green-600",
      onClick: () => modalState.setIsNotificationsModalOpen(true)
    },
    { 
      icon: Award, 
      title: "Travel Achievements", 
      subtitle: `Level ${stats.level} Explorer • ${stats.achievement_points} points earned`, 
      color: "text-purple-600",
      onClick: () => modalState.setIsTravelAchievementsModalOpen(true)
    },
    { 
      icon: Share, 
      title: "Share Profile", 
      subtitle: "Connect with travelers", 
      color: "text-orange-600",
      onClick: () => modalState.setIsShareProfileModalOpen(true)
    },
    { 
      icon: Settings, 
      title: "Settings", 
      subtitle: "App preferences", 
      color: "text-gray-600",
      onClick: () => modalState.setIsSettingsModalOpen(true)
    },
  ];
};
