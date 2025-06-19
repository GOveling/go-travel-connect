
import { Plane, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FlightBookingHeaderProps {
  onClose: () => void;
}

const FlightBookingHeader = ({ onClose }: FlightBookingHeaderProps) => {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 text-white relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="absolute right-2 top-2 text-white hover:bg-white/20 p-1 h-8 w-8"
      >
        <X size={16} />
      </Button>
      <div className="flex items-center space-x-3 pt-2">
        <Plane size={24} />
        <div>
          <h2 className="text-xl font-bold">Flight Booking</h2>
          <p className="text-sm opacity-90">Find and book your perfect flight</p>
        </div>
      </div>
    </div>
  );
};

export default FlightBookingHeader;
