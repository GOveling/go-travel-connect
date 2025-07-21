
import { FileText, Bell, Settings, Award, Share, MessageSquare, User } from "lucide-react";
import { MenuItemConfig } from "@/types/profile";
import { TravelStats } from "@/types/profile";
import { useGamification } from "@/hooks/useGamification";
import { useLanguage } from "@/contexts/LanguageContext";

interface ProfileMenuConfigProps {
  stats: TravelStats;
  modalState: {
    setIsTravelDocumentsModalOpen: (open: boolean) => void;
    setIsNotificationsModalOpen: (open: boolean) => void;
    setIsTravelAchievementsModalOpen: (open: boolean) => void;
    setIsShareProfileModalOpen: (open: boolean) => void;
    setIsSettingsModalOpen: (open: boolean) => void;
    setIsMyReviewsModalOpen: (open: boolean) => void;
    setIsPersonalInformationModalOpen: (open: boolean) => void;
  };
}

export const useProfileMenuConfig = ({ stats, modalState }: ProfileMenuConfigProps): MenuItemConfig[] => {
  const { currentLevel, totalPoints } = useGamification();
  const { t } = useLanguage();

  return [
    { 
      icon: User, 
      title: "Información Personal", 
      subtitle: "Administra tus datos personales", 
      color: "text-emerald-600",
      onClick: () => modalState.setIsPersonalInformationModalOpen(true)
    },
    { 
      icon: FileText, 
      title: t("profile.menu.travelDocuments.title"), 
      subtitle: t("profile.menu.travelDocuments.subtitle"), 
      color: "text-blue-600",
      onClick: () => modalState.setIsTravelDocumentsModalOpen(true)
    },
    { 
      icon: MessageSquare, 
      title: t("profile.menu.myReviews.title"), 
      subtitle: t("profile.menu.myReviews.subtitle"), 
      color: "text-indigo-600",
      onClick: () => modalState.setIsMyReviewsModalOpen(true)
    },
    { 
      icon: Bell, 
      title: t("profile.menu.notifications.title"), 
      subtitle: t("profile.menu.notifications.subtitle"), 
      color: "text-green-600",
      onClick: () => modalState.setIsNotificationsModalOpen(true)
    },
    { 
      icon: Award, 
      title: t("profile.menu.travelAchievements.title"), 
      subtitle: t("profile.menu.travelAchievements.subtitle", { 
        level: currentLevel.level.toString(), 
        title: currentLevel.title, 
        points: totalPoints.toString() 
      }), 
      color: "text-purple-600",
      onClick: () => modalState.setIsTravelAchievementsModalOpen(true)
    },
    { 
      icon: Share, 
      title: t("profile.menu.shareProfile.title"), 
      subtitle: t("profile.menu.shareProfile.subtitle"), 
      color: "text-orange-600",
      onClick: () => modalState.setIsShareProfileModalOpen(true)
    },
    { 
      icon: Settings, 
      title: t("profile.menu.settings.title"), 
      subtitle: t("profile.menu.settings.subtitle"), 
      color: "text-gray-600",
      onClick: () => modalState.setIsSettingsModalOpen(true)
    },
  ];
};
