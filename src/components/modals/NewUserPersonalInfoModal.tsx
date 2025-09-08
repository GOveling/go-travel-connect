import PersonalInformationModal from "./PersonalInformationModal";
import { useProfileData } from "@/hooks/useProfileData";
import { useEffect, useState } from "react";

interface NewUserPersonalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const NewUserPersonalInfoModal = ({
  isOpen,
  onClose,
  onComplete,
}: NewUserPersonalInfoModalProps) => {
  const { profile, refreshProfile, user } = useProfileData();
  const [showIntro, setShowIntro] = useState(false);

  useEffect(() => {
    if (isOpen && user?.id) {
      const key = `intro_shown_${user.id}`;
      const alreadyShown = localStorage.getItem(key);
      if (!alreadyShown) {
        setShowIntro(true);
        localStorage.setItem(key, "true");
      } else {
        setShowIntro(false);
      }
    }
  }, [isOpen, user?.id]);

  const handlePersonalInfoUpdate = () => {
    refreshProfile();
    onComplete();
  };

  return (
    <PersonalInformationModal
      isOpen={isOpen}
      onClose={onClose}
      profile={profile || undefined}
      onProfileUpdate={handlePersonalInfoUpdate}
      showIntroMessage={showIntro}
    />
  );
};

export default NewUserPersonalInfoModal;
