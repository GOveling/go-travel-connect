
import { FileText, Bell, Settings, Award, Share, MessageSquare } from "lucide-react";
import { MenuItemConfig } from "@/types/profile";
import { TravelStats } from "@/types/profile";
import { useGamification } from "@/hooks/useGamification";

interface ProfileMenuConfigProps {
  stats: TravelStats;
  modalState: {
    setIsTravelDocumentsModalOpen: (open: boolean) => void;
    setIsNotificationsModalOpen: (open: boolean) => void;
    setIsTravelAchievementsModalOpen: (open: boolean) => void;
    setIsShareProfileModalOpen: (open: boolean) => void;
    setIsSettingsModalOpen: (open: boolean) => void;
    setIsMyReviewsModalOpen: (open: boolean) => void;
  };
}

export const useProfileMenuConfig = ({ stats, modalState }: ProfileMenuConfigProps): MenuItemConfig[] => {
  const { currentLevel, totalPoints } = useGamification();

  return [
    { 
      icon: FileText, 
      title: "Travel Documents", 
      subtitle: "Passports, visas, tickets", 
      color: "text-blue-600",
      onClick: () => modalState.setIsTravelDocumentsModalOpen(true)
    },
    { 
      icon: MessageSquare, 
      title: "My Reviews", 
      subtitle: "Manage your place reviews", 
      color: "text-indigo-600",
      onClick: () => modalState.setIsMyReviewsModalOpen(true)
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
      subtitle: `Level ${currentLevel.level} ${currentLevel.title} • ${totalPoints} points earned`, 
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
