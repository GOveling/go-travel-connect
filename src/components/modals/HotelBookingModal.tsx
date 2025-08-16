import { Dialog, DialogContent } from "@/components/ui/dialog";

interface HotelBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HotelBookingModal = ({ isOpen, onClose }: HotelBookingModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md mx-auto max-h-[90vh] overflow-hidden p-6 rounded-xl">
        <div className="space-y-4">
          <h3 className="font-medium text-foreground">Buscar Hoteles</h3>
          <div className="w-full flex justify-center">
            <iframe
              src="https://www.trip.com/partners/ad/S4621388?Allianceid=6829152&SID=242267565&trip_sub1="
              style={{ width: "310px", height: "465px" }}
              frameBorder="0"
              scrolling="no"
              className="border-none"
              id="S4621388"
              title="Trip.com Hotel Search Widget"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default HotelBookingModal;
