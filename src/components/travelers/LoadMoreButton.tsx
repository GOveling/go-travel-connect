
import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const LoadMoreButton = () => {
  return (
    <div className="text-center">
      <Button variant="outline" className="border-2 border-purple-500 text-purple-600 hover:bg-purple-50 hover:text-purple-700">
        <Users size={16} className="mr-2" />
        Discover More Travelers
      </Button>
    </div>
  );
};

export default LoadMoreButton;
