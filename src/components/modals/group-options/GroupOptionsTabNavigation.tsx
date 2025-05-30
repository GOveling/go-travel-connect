
import { Button } from "@/components/ui/button";
import { DollarSign, Vote } from "lucide-react";

interface GroupOptionsTabNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const GroupOptionsTabNavigation = ({
  activeTab,
  setActiveTab
}: GroupOptionsTabNavigationProps) => {
  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-4 md:mb-6 flex-shrink-0">
      <Button
        variant={activeTab === "expenses" ? "default" : "ghost"}
        className={`flex-1 min-h-[48px] text-xs md:text-sm px-2 md:px-4 ${
          activeTab === "expenses" 
            ? "bg-[#EA6123] text-white hover:bg-[#EA6123] shadow-sm" 
            : "text-black hover:text-black"
        }`}
        onClick={() => setActiveTab("expenses")}
      >
        <DollarSign size={16} className="mr-1 md:mr-2" />
        <span className="hidden sm:inline">Split Costs</span>
        <span className="sm:hidden">Costs</span>
      </Button>
      <Button
        variant={activeTab === "decisions" ? "default" : "ghost"}
        className={`flex-1 min-h-[48px] text-xs md:text-sm px-2 md:px-4 ${
          activeTab === "decisions" 
            ? "bg-[#EA6123] text-white hover:bg-[#EA6123] shadow-sm" 
            : "text-black hover:text-black"
        }`}
        onClick={() => setActiveTab("decisions")}
      >
        <Vote size={16} className="mr-1 md:mr-2" />
        <span className="hidden sm:inline">Group Decisions</span>
        <span className="sm:hidden">Decisions</span>
      </Button>
    </div>
  );
};

export default GroupOptionsTabNavigation;
