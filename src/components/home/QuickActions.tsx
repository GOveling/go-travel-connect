
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

const QuickActions = () => {
  return (
    <div className="grid grid-cols-1 gap-4">
      <Button variant="outline" className="h-16 flex-col space-y-1 border-2 border-purple-200 hover:bg-purple-50 text-purple-700 hover:text-black">
        <Bell size={20} />
        <span className="text-sm">Nearby Alerts</span>
      </Button>
    </div>
  );
};

export default QuickActions;
