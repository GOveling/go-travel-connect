
import { Plane, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FlightBookingHeaderProps {
  onClose: () => void;
}

const FlightBookingHeader = ({ onClose }: FlightBookingHeaderProps) => {
  return (
    <div className="bg-gradient-to-r from-purple-600 to-orange-500 p-6 text-white relative rounded-t-2xl">
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="absolute right-3 top-3 text-white hover:bg-white/20 p-2 h-8 w-8 rounded-full"
      >
        <X size={16} />
      </Button>
      <div className="flex items-center space-x-3 pt-2">
        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
          <Plane size={20} />
        </div>
        <div>
          <h2 className="text-xl font-bold">Flight Booking</h2>
          <p className="text-sm opacity-90">Find and book your perfect flight</p>
        </div>
      </div>
    </div>
  );
};

export default FlightBookingHeader;
