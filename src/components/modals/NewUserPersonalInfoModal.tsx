import PersonalInformationModal from "./PersonalInformationModal";
import { useProfileData } from "@/hooks/useProfileData";

interface NewUserPersonalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const NewUserPersonalInfoModal = ({ isOpen, onClose, onComplete }: NewUserPersonalInfoModalProps) => {
  const { profile, refreshProfile } = useProfileData();

  const handlePersonalInfoUpdate = () => {
    refreshProfile();
    onComplete();
  };

  return (
    <PersonalInformationModal
      isOpen={isOpen}
      onClose={handlePersonalInfoUpdate}
      profile={profile || undefined}
      onProfileUpdate={handlePersonalInfoUpdate}
    />
  );
};

export default NewUserPersonalInfoModal;