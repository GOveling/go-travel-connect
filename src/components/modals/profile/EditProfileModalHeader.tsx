import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLanguage } from "@/hooks/useLanguage";

interface EditProfileModalHeaderProps {
  onClose: () => void;
}

const EditProfileModalHeader = ({ onClose }: EditProfileModalHeaderProps) => {
  const { t } = useLanguage();

  return (
    <div className="bg-gradient-to-r from-purple-600 to-orange-500 p-6 text-white relative">
      <DialogHeader>
        <DialogTitle className="text-xl font-bold text-center">
          {t("profile.editProfile")}
        </DialogTitle>
      </DialogHeader>
    </div>
  );
};

export default EditProfileModalHeader;
