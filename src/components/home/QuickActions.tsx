import { Bell } from "lucide-react";
import { ButtonColorful } from "@/components/ui/button-colorful";

interface QuickActionsProps {
  onNearbyAlertsClick: () => void;
}

const QuickActions = ({ onNearbyAlertsClick }: QuickActionsProps) => {
  return (
    <div className="grid grid-cols-1 gap-4">
      <ButtonColorful
        className="h-16 flex-col space-y-1"
        label="Nearby Alerts"
        onClick={onNearbyAlertsClick}
      />
    </div>
  );
};

export default QuickActions;
