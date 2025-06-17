
import { Button } from "@/components/ui/button";
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

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
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:bg-white/20"
      >
        <X size={20} />
      </Button>
    </div>
  );
};

export default EditProfileModalHeader;
