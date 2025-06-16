
import { useState } from "react";

export const useProfileModals = () => {
  const [isTravelDocumentsModalOpen, setIsTravelDocumentsModalOpen] = useState(false);
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [isTravelAchievementsModalOpen, setIsTravelAchievementsModalOpen] = useState(false);
  const [isShareProfileModalOpen, setIsShareProfileModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  return {
    isTravelDocumentsModalOpen,
    setIsTravelDocumentsModalOpen,
    isNotificationsModalOpen,
    setIsNotificationsModalOpen,
    isTravelAchievementsModalOpen,
    setIsTravelAchievementsModalOpen,
    isShareProfileModalOpen,
    setIsShareProfileModalOpen,
    isSettingsModalOpen,
    setIsSettingsModalOpen,
  };
};
