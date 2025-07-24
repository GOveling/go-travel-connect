import { Dialog, DialogContent } from "@/components/ui/dialog";
import EditProfileModalHeader from "./profile/EditProfileModalHeader";
import EditProfileForm from "./profile/EditProfileForm";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
  onProfileUpdate: () => void;
}

const EditProfileModal = ({
  isOpen,
  onClose,
  profile,
  onProfileUpdate,
}: EditProfileModalProps) => {
  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto rounded-2xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <EditProfileModalHeader onClose={handleClose} />
        <EditProfileForm
          profile={profile}
          onProfileUpdate={onProfileUpdate}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileModal;
