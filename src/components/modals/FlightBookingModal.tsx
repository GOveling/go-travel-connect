import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useHomeState } from "@/hooks/useHomeState";
import FlightBookingContent from "./flight-booking/FlightBookingContent";

interface FlightBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  from: string;
  to: string;
  departDate: string;
  returnDate: string;
  passengers: number;
  class: string;
}

interface MultiCityFlight {
  from: string;
  to: string;
  departDate: string;
  passengers: number;
  class: string;
}

const FlightBookingModal = ({ isOpen, onClose }: FlightBookingModalProps) => {
  const [tripType, setTripType] = useState<
    "round-trip" | "one-way" | "multi-city" | "manual"
  >("round-trip");
  const [isDateRangeOpen, setIsDateRangeOpen] = useState(false);
  const [isDepartDateOpen, setIsDepartDateOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    from: "",
    to: "",
    departDate: "",
    returnDate: "",
    passengers: 1,
    class: "economy",
  });
  const [multiCityFlights, setMultiCityFlights] = useState<MultiCityFlight[]>([
    { from: "", to: "", departDate: "", passengers: 1, class: "economy" },
    { from: "", to: "", departDate: "", passengers: 1, class: "economy" },
  ]);
  const [selectedTrip, setSelectedTrip] = useState<number | null>(null);
  const [showAIRecommendation, setShowAIRecommendation] = useState(false);
  const { trips } = useHomeState();
  const { toast } = useToast();

  const handleTripSelection = (tripId: number) => {
    setSelectedTrip(tripId);
  };

  const handleComplete = () => {
    toast({
      title: "Búsqueda de vuelos iniciada",
      description: "Buscando los mejores vuelos para tu viaje...",
    });
    onClose();
  };

  const resetForm = () => {
    setTripType("round-trip");
    setFormData({
      from: "",
      to: "",
      departDate: "",
      returnDate: "",
      passengers: 1,
      class: "economy",
    });
    setMultiCityFlights([
      { from: "", to: "", departDate: "", passengers: 1, class: "economy" },
      { from: "", to: "", departDate: "", passengers: 1, class: "economy" },
    ]);
    setSelectedTrip(null);
    setShowAIRecommendation(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-lg mx-auto max-h-[95vh] overflow-hidden p-0 rounded-xl">
        <FlightBookingContent
          tripType={tripType}
          setTripType={setTripType}
          formData={formData}
          setFormData={setFormData}
          multiCityFlights={multiCityFlights}
          setMultiCityFlights={setMultiCityFlights}
          selectedTrip={selectedTrip}
          handleTripSelection={handleTripSelection}
          trips={trips}
          isDateRangeOpen={isDateRangeOpen}
          setIsDateRangeOpen={setIsDateRangeOpen}
          isDepartDateOpen={isDepartDateOpen}
          setIsDepartDateOpen={setIsDepartDateOpen}
          showAIRecommendation={showAIRecommendation}
          setShowAIRecommendation={setShowAIRecommendation}
          onComplete={handleComplete}
          onClose={onClose}
          onReset={resetForm}
        />
      </DialogContent>
    </Dialog>
  );
};

export default FlightBookingModal;
