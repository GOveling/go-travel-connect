import { Dialog, DialogContent } from "@/components/ui/dialog";
import TripComWidget from "./flight-booking/TripComWidget";

interface FlightBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FlightBookingModal = ({ isOpen, onClose }: FlightBookingModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-4xl mx-auto max-h-[95vh] overflow-hidden p-6 rounded-xl">
        <TripComWidget />
      </DialogContent>
    </Dialog>
  );
};

export default FlightBookingModal;
