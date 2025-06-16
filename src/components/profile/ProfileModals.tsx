
import TravelDocumentsModal from "@/components/modals/TravelDocumentsModal";
import NotificationsModal from "@/components/modals/NotificationsModal";
import TravelAchievementsModal from "@/components/modals/TravelAchievementsModal";
import ShareProfileModal from "@/components/modals/ShareProfileModal";
import SettingsModal from "@/components/modals/SettingsModal";

interface ProfileModalsProps {
  isTravelDocumentsModalOpen: boolean;
  setIsTravelDocumentsModalOpen: (open: boolean) => void;
  isNotificationsModalOpen: boolean;
  setIsNotificationsModalOpen: (open: boolean) => void;
  isTravelAchievementsModalOpen: boolean;
  setIsTravelAchievementsModalOpen: (open: boolean) => void;
  isShareProfileModalOpen: boolean;
  setIsShareProfileModalOpen: (open: boolean) => void;
  isSettingsModalOpen: boolean;
  setIsSettingsModalOpen: (open: boolean) => void;
}

const ProfileModals = ({
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
}: ProfileModalsProps) => {
  return (
    <>
      <TravelAchievementsModal
        isOpen={isTravelAchievementsModalOpen}
        onClose={() => setIsTravelAchievementsModalOpen(false)}
      />

      <ShareProfileModal
        isOpen={isShareProfileModalOpen}
        onClose={() => setIsShareProfileModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
      />

      <TravelDocumentsModal
        isOpen={isTravelDocumentsModalOpen}
        onClose={() => setIsTravelDocumentsModalOpen(false)}
      />

      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
      />
    </>
  );
};

export default ProfileModals;
