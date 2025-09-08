import { Bell } from "lucide-react";
import { ButtonColorful } from "@/components/ui/button-colorful";
import { useLanguage } from "@/hooks/useLanguage";

interface QuickActionsProps {
  onNearbyAlertsClick: () => void;
}

const QuickActions = ({ onNearbyAlertsClick }: QuickActionsProps) => {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-1 gap-4">
      <ButtonColorful
        className="h-16 flex-col space-y-1"
        label={t("home.quickActions.nearbyAlerts")}
        onClick={onNearbyAlertsClick}
      />
    </div>
  );
};

export default QuickActions;
